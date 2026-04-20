export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { retrieveEvaluationContext } from '@/lib/handbook-rag';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { simId, templateId, languageMode, messages, documentation } = body ?? {};

    if (!simId) {
      return NextResponse.json({ error: 'simId required' }, { status: 400 });
    }

    const template = await prisma.simulationTemplate.findUnique({
      where: { id: templateId },
    });

    const sim = await prisma.userSimulation.findUnique({
      where: { id: simId },
    });

    const isBilingual = languageMode === 'bilingual';
    const simType = template?.type || 'oral_exam';
    const checklist = (template?.checklist as any[]) || [];
    const hasChecklist = checklist.length > 0;
    const hasDocumentation = !!(documentation || sim?.documentation);
    const docText = documentation || sim?.documentation || '';
    const requiresDoc = simType === 'patient_conversation' || simType === 'written_task';

    // RAG context
    let handbookContext = '';
    try {
      const topicFromTemplate = template?.titleDe ?? template?.descriptionDe ?? '';
      handbookContext = await retrieveEvaluationContext(topicFromTemplate, template?.domain ?? 'nursing');
    } catch (e) { /* continue */ }

    // Build conversation text
    const conversationText = (messages ?? []).map((m: any) => {
      const role = m?.role === 'user' ? 'Kandidat' : (simType === 'patient_conversation' ? 'Patient' : 'Prüfer');
      return `${role}: ${m?.content ?? ''}`;
    }).join('\n');

    // Build checklist section for prompt
    let checklistPromptSection = '';
    if (hasChecklist) {
      checklistPromptSection = `\nCHECKLISTE - Bewerte JEDEN Punkt einzeln:\n${checklist.map((item: any, i: number) => 
        `${i + 1}. [ID: ${item.id}] ${item.textDe} (Kategorie: ${item.category}, Gewichtung: ${item.weight === 3 ? 'KRITISCH' : item.weight === 2 ? 'Wichtig' : 'Normal'})`
      ).join('\n')}\n`;
    }

    // Type-specific evaluation instructions
    const typeInstructions: Record<string, string> = {
      patient_conversation: `WICHTIG FÜR PATIENTENGESPRÄCH:
- Medizinische Fachsprache gegenüber dem Patienten ist ein FEHLER und muss negativ bewertet werden.
- Bewerte stattdessen: Verständliche Sprache, aktives Zuhören, Empathie, Informationserhebung.
- Prüfe, ob der Kandidat Auffälligkeiten des Patienten (z.B. Ängstlichkeit, kognitive Ausfälle, Depression) erkannt hat.
- Falls Dokumentation vorhanden: Bewerte Vollständigkeit und ob erkannte Auffälligkeiten dokumentiert wurden.`,
      oral_exam: `WICHTIG FÜR MÜNDLICHE PRÜFUNG:
- Medizinische Fachsprache ist ERWÜNSCHT und wird positiv bewertet.
- Bewerte: Fachwissen, korrekte Terminologie, logische Argumentation, Vollständigkeit.`,
      written_task: `WICHTIG FÜR SCHRIFTLICHE AUFGABE:
- Medizinische Fachsprache ist ERWÜNSCHT und wird positiv bewertet.
- Bewerte: Strukturierte Dokumentation, Fachterminologie, Pflegeplanung, Vollständigkeit.
- Falls Dokumentation vorhanden: Bewerte Struktur, Fachbegriffe und Vollständigkeit.`,
    };

    // Documentation section
    let docPromptSection = '';
    if (requiresDoc && hasDocumentation) {
      docPromptSection = `\n\nVOM KANDIDATEN ERSTELLTE DOKUMENTATION:\n---\n${docText}\n---\nBewerte die Dokumentation auf: Vollständigkeit, korrekte Fachsprache, Struktur, ob alle relevanten Beobachtungen und Maßnahmen enthalten sind.`;
    } else if (requiresDoc && !hasDocumentation) {
      docPromptSection = `\n\nHINWEIS: Der Kandidat hat KEINE Dokumentation erstellt. Dies ist ein erheblicher Mangel und muss in der Bewertung berücksichtigt werden.`;
    }

    const evaluationPrompt = `Du bist ein erfahrener Prüfer für die Pflegeexamensprüfung in Deutschland.

Simulationstyp: ${simType === 'patient_conversation' ? 'Patientengespräch' : simType === 'oral_exam' ? 'Mündliche Prüfung' : 'Schriftliche Aufgabe'}
Aufgabenstellung: ${template?.descriptionDe || ''}

${typeInstructions[simType] || ''}
${handbookContext}
${checklistPromptSection}

GESPRÄCH:
${conversationText}
${docPromptSection}

Gib deine Bewertung im folgenden JSON-Format zurück:
{
  "checklistResults": [
    ${hasChecklist ? checklist.map((item: any) => `{"id": "${item.id}", "fulfilled": true/false, "score": 0-10, "commentDe": "Kurzer Kommentar", "commentTr": "${isBilingual ? 'Kısa yorum' : ''}"}`).join(',\n    ') : '[]'}
  ],
  "scores": {
    ${simType === 'patient_conversation'
      ? '"verstaendlichkeit": <1-10>,\n    "informationserhebung": <1-10>,\n    "empathie": <1-10>,\n    "beobachtung": <1-10>'
      : '"fachsprache": <1-10>,\n    "struktur": <1-10>,\n    "fachwissen": <1-10>'}
  },
  ${requiresDoc ? `"docScore": ${hasDocumentation ? '<1-10>' : '0'},
  "docFeedbackDe": "${hasDocumentation ? 'Feedback zur Dokumentation' : 'Keine Dokumentation erstellt. Dies ist ein erheblicher Mangel.'}",
  "docFeedbackTr": "${isBilingual ? (hasDocumentation ? 'Dokümantasyon hakkında geri bildirim' : 'Dokümantasyon oluşturulmadı. Bu önemli bir eksikliktir.') : ''}",` : ''}
  "feedback_de": "Ausführliches Feedback auf Deutsch (5-8 Sätze). Gehe auf die Checklisten-Ergebnisse ein.",
  "feedback_tr": "${isBilingual ? 'Aynı geri bildirimin Türkçe çevirisi, 5-8 cümle' : ''}"
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
        max_tokens: 3000,
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
        checklistResults: [],
        scores: { fachsprache: 5, struktur: 5, empathie: 5 },
        feedback_de: 'Bewertung konnte nicht korrekt generiert werden.',
        feedback_tr: isBilingual ? 'Değerlendirme doğru bir şekilde oluşturulamadı.' : '',
      };
    }

    // Save evaluation
    const evaluation = await prisma.evaluation.upsert({
      where: { simulationId: simId },
      update: {
        feedbackDe: evalResult?.feedback_de ?? '',
        feedbackTr: evalResult?.feedback_tr ?? '',
        scores: evalResult?.scores ?? {},
        checklistResults: evalResult?.checklistResults ?? [],
        docFeedbackDe: evalResult?.docFeedbackDe ?? null,
        docFeedbackTr: evalResult?.docFeedbackTr ?? null,
        docScore: evalResult?.docScore != null ? Number(evalResult.docScore) : null,
      },
      create: {
        simulationId: simId,
        feedbackDe: evalResult?.feedback_de ?? '',
        feedbackTr: evalResult?.feedback_tr ?? '',
        scores: evalResult?.scores ?? {},
        checklistResults: evalResult?.checklistResults ?? [],
        docFeedbackDe: evalResult?.docFeedbackDe ?? null,
        docFeedbackTr: evalResult?.docFeedbackTr ?? null,
        docScore: evalResult?.docScore != null ? Number(evalResult.docScore) : null,
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
