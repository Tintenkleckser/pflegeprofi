export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { simId, templateId, languageMode, messages } = body ?? {};

    if (!simId) {
      return NextResponse.json({ error: 'simId required' }, { status: 400 });
    }

    const template = await prisma.simulationTemplate.findUnique({
      where: { id: templateId },
    });

    const isBilingual = languageMode === 'bilingual';

    // Build evaluation prompt
    const conversationText = (messages ?? []).map((m: any) => {
      const role = m?.role === 'user' ? 'Kandidat' : 'Patient';
      return `${role}: ${m?.content ?? ''}`;
    }).join('\n');

    const evaluationPrompt = `Du bist ein erfahrener Prüfer für die Pflegeexamensprüfung in Deutschland.

Bewerte das folgende Anamnesegespräch eines Prüfungskandidaten.

GESPRÄCH:
${conversationText}

BEWERTUNGSKRITERIEN:
1. Fachsprache (1-10): Korrekte Verwendung medizinischer/pflegerischer Fachbegriffe
2. Struktur (1-10): Logischer und systematischer Aufbau des Anamnesegesprächs
3. Empathie (1-10): Einfühlsame und patientenorientierte Gesprächsführung

Gib deine Bewertung im folgenden JSON-Format zurück:
{
  "scores": {
    "fachsprache": <1-10>,
    "struktur": <1-10>,
    "empathie": <1-10>
  },
  "feedback_de": "<Ausführliches Feedback auf Deutsch, 3-5 Sätze>",
  "feedback_tr": "<${isBilingual ? 'Aynı geri bildirimin Türkçe çevirisi, 3-5 cümle' : 'Leerer String'}>"
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: 'Du bist ein Prüfungsbewerter. Antworte ausschließlich mit validem JSON.' },
          { role: 'user', content: evaluationPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!llmResponse?.ok) {
      const errText = await llmResponse?.text?.();
      console.error('Evaluation LLM error:', errText);
      return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData?.choices?.[0]?.message?.content ?? '{}';

    let evalResult: any;
    try {
      evalResult = JSON.parse(rawContent);
    } catch (e: any) {
      console.error('Failed to parse evaluation JSON:', rawContent);
      evalResult = {
        scores: { fachsprache: 5, struktur: 5, empathie: 5 },
        feedback_de: 'Bewertung konnte nicht korrekt generiert werden.',
        feedback_tr: 'Değerlendirme doğru bir şekilde oluşturulamadı.',
      };
    }

    // Save evaluation
    const evaluation = await prisma.evaluation.upsert({
      where: { simulationId: simId },
      update: {
        feedbackDe: evalResult?.feedback_de ?? '',
        feedbackTr: evalResult?.feedback_tr ?? '',
        scores: evalResult?.scores ?? {},
      },
      create: {
        simulationId: simId,
        feedbackDe: evalResult?.feedback_de ?? '',
        feedbackTr: evalResult?.feedback_tr ?? '',
        scores: evalResult?.scores ?? {},
      },
    });

    // Mark simulation as completed
    await prisma.userSimulation.update({
      where: { id: simId },
      data: { status: 'completed', completedAt: new Date() },
    });

    return NextResponse.json({ id: evaluation?.id, evaluationId: evaluation?.id });
  } catch (error: any) {
    console.error('Evaluation route error:', error);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
