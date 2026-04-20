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
      documentation: 'Pflegedokumentation (Erstellen einer vollständigen Pflegedokumentation basierend auf einem Fallbeispiel)',
    };

    const difficultyInstructions: Record<string, string> = {
      beginner: 'EINSTEIGER-Niveau: Einfache, klare Aufgabenstellung. Der Patient/Prüfer ist kooperativ und geduldig. Grundlagenwissen wird abgefragt.',
      intermediate: 'MITTLERES Niveau: Komplexere Situation mit mehreren Aspekten. Einige Komplikationen möglich. Fachwissen und Kommunikationsfähigkeit werden geprüft.',
      advanced: 'FORTGESCHRITTENES Niveau: Anspruchsvolle Situation mit Komplikationen, schwierigen Patienten/Angehörigen oder ethischen Dilemmata. Tiefes Fachwissen und Problemlösungskompetenz erforderlich.',
    };

    const maxTurns = difficulty === 'beginner' ? 6 : difficulty === 'intermediate' ? 8 : 10;

    const checklistGuidance: Record<string, string> = {
      patient_conversation: `CHECKLISTE FÜR PATIENTENGESPRÄCH:
- WICHTIG: Medizinische Fachsprache ist im Patientengespräch ein FEHLER. Der Patient versteht keine Fachbegriffe.
- Die Checkliste soll prüfen: Verständliche Sprache, aktives Zuhören, Empathie, vollständige Informationserhebung.
- Baue subtile Auffälligkeiten beim Patienten ein (z.B. Ängstlichkeit, Vergesslichkeit, kognitive Ausfälle, Hinweise auf Verwahrlosung, Depression), 
  die der Kandidat erkennen und ggf. dem behandelnden Arzt mitteilen sollte.
- Checklist-Items sollen auch prüfen, ob der Kandidat diese Auffälligkeiten bemerkt hat.
- Füge ein Item hinzu: "Dokumentation erstellt" (wird separat bewertet).`,
      oral_exam: `CHECKLISTE FÜR MÜNDLICHE PRÜFUNG:
- Medizinische Fachsprache ist ERWÜNSCHT und NOTWENDIG.
- Die Checkliste soll Fachwissen, korrekte Terminologie, logische Argumentation und Vollständigkeit prüfen.
- Füge spezifische Fachfragen ein, die der Kandidat beantworten sollte.`,
      written_task: `CHECKLISTE FÜR SCHRIFTLICHE AUFGABE:
- Medizinische Fachsprache ist ERWÜNSCHT und NOTWENDIG.
- Die Checkliste soll Struktur, Vollständigkeit, korrekte Fachbegriffe und Pflegeplanung prüfen.
- Füge ein Item hinzu: "Dokumentation erstellt" (wird separat bewertet).`,
      documentation: `CHECKLISTE FÜR PFLEGEDOKUMENTATION:
- Medizinische Fachsprache ist ERWÜNSCHT und NOTWENDIG.
- Die Checkliste soll prüfen: Pflegeanamnese, Pflegeplanung, Pflegebericht, Maßnahmen, Evaluation.
- Der Kandidat erhält ein Fallbeispiel und muss eine vollständige Pflegedokumentation erstellen.
- Keine Chat-Interaktion nötig – der Fokus liegt auf der schriftlichen Dokumentation.
- Die Checkliste soll spezifische Dokumentationsbestandteile prüfen (z.B. Ressourcen, Pflegeziele, geplante Maßnahmen).`,
    };

    const requiresDocumentation = simulationType === 'patient_conversation' || simulationType === 'written_task' || simulationType === 'documentation';

    const generatePrompt = `Du bist ein Experte für die Erstellung von Pflegeprüfungs-Simulationen für ausländische Pflegekräfte in Deutschland.

Erstelle ein realistisches Prüfungsszenario zum Thema "${topic.titleDe}" (${topic.descriptionDe}).

Typ: ${typeLabels[simulationType] || simulationType}
Schwierigkeitsgrad: ${difficultyInstructions[difficulty] || difficulty}
${handbookContext ? `\n${handbookContext}\n` : ''}

${checklistGuidance[simulationType] || ''}

Antworte AUSSCHLIESSLICH als valides JSON mit folgender Struktur (KEINE Markdown-Codeblöcke, KEIN Text davor/danach):
{
  "titleDe": "Kurzer, prägnanter Titel auf Deutsch",
  "titleTr": "Gleicher Titel auf Türkisch",
  "descriptionDe": "Ausführliche Aufgabenstellung (3-5 Sätze) auf Deutsch. Beschreibe die Situation, den Patienten und die Erwartungen.",
  "descriptionTr": "Gleiche Aufgabenstellung auf Türkisch",
  "systemPrompt": "Detaillierte Rollenanweisung für den KI-Prüfer/Patienten. Beschreibe: Name, Alter, Vorgeschichte, Beschwerden, Persönlichkeit, Gesprächsverhalten. Mindestens 200 Wörter.${simulationType === 'patient_conversation' ? ' Baue subtile Auffälligkeiten ein (z.B. Ängstlichkeit, Vergesslichkeit, beginnende Demenz, Depression), die ein aufmerksamer Pfleger erkennen sollte.' : ''}",
  "evaluationCriteria": ["Kriterium1", "Kriterium2", ...],
  "checklist": [
    {"id": "1", "textDe": "Beschreibung der Aufgabe auf Deutsch", "textTr": "Türkische Übersetzung", "category": "Kategorie", "weight": 1-3},
    ...
  ]
}

CHECKLIST-REGELN:
- Erstelle 8-15 spezifische, überprüfbare Checklist-Items
- Jedes Item hat: id (String), textDe, textTr, category (z.B. "Kommunikation", "Fachwissen", "Beobachtung", "Dokumentation"), weight (1=normal, 2=wichtig, 3=kritisch)
- Die Items müssen SPEZIFISCH zum Szenario passen, nicht generisch sein
${requiresDocumentation ? '- Füge mindestens ein Item der Kategorie "Dokumentation" hinzu' : ''}
- Bei Patientengesprächen: Items für das Erkennen von Auffälligkeiten mit weight=3

WICHTIG:
- Das Szenario muss realistisch und prüfungsrelevant sein
- Verwende echte medizinische Fachbegriffe im systemPrompt
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
        checklist: parsed.checklist || [],
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
