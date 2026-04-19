export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { retrieveHandbookContext } from '@/lib/handbook-rag';
import { TOPIC_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/topic-categories';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topicId, difficulty, simulationType } = body ?? {};

    if (!topicId || !difficulty || !simulationType) {
      return NextResponse.json({ error: 'Fehlende Felder: topicId, difficulty, simulationType' }, { status: 400 });
    }

    const topic = TOPIC_CATEGORIES.find(t => t.id === topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Unbekanntes Thema' }, { status: 400 });
    }

    const diffLevel = DIFFICULTY_LEVELS.find(d => d.id === difficulty);
    if (!diffLevel) {
      return NextResponse.json({ error: 'Unbekannter Schwierigkeitsgrad' }, { status: 400 });
    }

    // Retrieve handbook context for this topic
    const handbookContext = await retrieveHandbookContext(
      topic.keywords.join(' '),
      'nursing',
      3
    );

    const typeLabels: Record<string, string> = {
      oral_exam: 'Mündliche Prüfung (Prüfungsgespräch mit einem Prüfer)',
      patient_conversation: 'Patientengespräch (Gespräch mit einem Patienten oder Angehörigen)',
      written_task: 'Schriftliche Aufgabe (Pflegeplanung, Pflegebericht oder Dokumentation)',
    };

    const difficultyInstructions: Record<string, string> = {
      beginner: 'EINSTEIGER-Niveau: Einfache, klare Aufgabenstellung. Der Patient/Prüfer ist kooperativ und geduldig. Grundlagenwissen wird abgefragt.',
      intermediate: 'MITTLERES Niveau: Komplexere Situation mit mehreren Aspekten. Einige Komplikationen möglich. Fachwissen und Kommunikationsfähigkeit werden geprüft.',
      advanced: 'FORTGESCHRITTENES Niveau: Anspruchsvolle Situation mit Komplikationen, schwierigen Patienten/Angehörigen oder ethischen Dilemmata. Tiefes Fachwissen und Problemlösungskompetenz erforderlich.',
      extreme: 'EXTREMES Niveau: Hochkomplexe Notfallsituation oder ethisch sehr schwieriges Szenario. Multimorbider Patient mit Komplikationen. Zeitdruck, widersprüchliche Informationen, emotionale Belastung. Prüfungsniveau für erfahrene Fachkräfte.',
    };

    const maxTurns = difficulty === 'beginner' ? 6 : difficulty === 'intermediate' ? 8 : difficulty === 'advanced' ? 10 : 12;

    const generatePrompt = `Du bist ein Experte für die Erstellung von Pflegeprüfungs-Simulationen für ausländische Pflegekräfte in Deutschland.

Erstelle ein realistisches Prüfungsszenario zum Thema "${topic.titleDe}" (${topic.descriptionDe}).

Typ: ${typeLabels[simulationType] || simulationType}
Schwierigkeitsgrad: ${difficultyInstructions[difficulty] || difficulty}
${handbookContext ? `\n${handbookContext}\n` : ''}

Antworte AUSSCHLIESSLICH als valides JSON mit folgender Struktur (KEINE Markdown-Codeblöcke, KEIN Text davor/danach):
{
  "titleDe": "Kurzer, prägnanter Titel auf Deutsch",
  "titleTr": "Gleicher Titel auf Türkisch",
  "descriptionDe": "Ausführliche Aufgabenstellung (3-5 Sätze) auf Deutsch. Beschreibe die Situation, den Patienten und die Erwartungen.",
  "descriptionTr": "Gleiche Aufgabenstellung auf Türkisch",
  "systemPrompt": "Detaillierte Rollenanweisung für den KI-Prüfer/Patienten. Beschreibe: Name, Alter, Vorgeschichte, Beschwerden, Persönlichkeit, Gesprächsverhalten. Mindestens 200 Wörter.",
  "evaluationCriteria": ["Fachsprache", "Kommunikation", "Pflegefachwissen", "Empathie", "Problemlösung"]
}

WICHTIG:
- Das Szenario muss realistisch und prüfungsrelevant sein
- Verwende echte medizinische Fachbegriffe
- Der systemPrompt muss sehr detailliert sein, damit die KI die Rolle überzeugend spielen kann
- Passe Komplexität an den Schwierigkeitsgrad an
- Bei "Extrem": Baue mehrere Komplikationen, Zeitdruck und emotionale Herausforderungen ein`;

    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: generatePrompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text().catch(() => 'Unknown error');
      console.error('LLM API error:', llmResponse.status, errText);
      return NextResponse.json({ error: 'LLM-API-Fehler. Bitte versuchen Sie es erneut.' }, { status: 502 });
    }

    const llmData = await llmResponse.json();
    const content = llmData?.choices?.[0]?.message?.content ?? '';
    
    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse LLM response:', content);
      return NextResponse.json({ error: 'Szenario konnte nicht generiert werden. Bitte versuchen Sie es erneut.' }, { status: 500 });
    }

    // Save as new SimulationTemplate
    const template = await prisma.simulationTemplate.create({
      data: {
        domain: 'nursing',
        type: simulationType,
        difficulty,
        titleDe: parsed.titleDe || `${topic.titleDe} - ${diffLevel.labelDe}`,
        titleTr: parsed.titleTr || `${topic.titleTr} - ${diffLevel.labelTr}`,
        descriptionDe: parsed.descriptionDe || topic.descriptionDe,
        descriptionTr: parsed.descriptionTr || topic.descriptionTr,
        systemPrompt: parsed.systemPrompt || '',
        evaluationCriteria: parsed.evaluationCriteria || ['Fachsprache', 'Kommunikation', 'Pflegefachwissen', 'Empathie'],
        maxTurns,
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Generate simulation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Simulation-Generierung: ' + (error?.message || 'Unbekannt') },
      { status: 500 }
    );
  }
}
