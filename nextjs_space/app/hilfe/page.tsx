import Link from 'next/link';
import { LegalPage, LegalSection } from '@/components/legal-page';
import { Badge } from '@/components/ui/badge';

const faqs = [
  {
    question: 'Was ist PflegeProfi?',
    answer: 'PflegeProfi ist eine Lernanwendung fur Pflegekrafte, die realistische Simulationsfalle, Fachsprache und Feedback fur die Prufungsvorbereitung verbindet.',
  },
  {
    question: 'Welche Daten brauche ich fur ein Konto?',
    answer: 'Fur die Registrierung wird aktuell nur eine E-Mail-Adresse und ein Passwort benotigt. Das Passwort wird uber Supabase Auth verarbeitet und nicht als Klartext in der App-Datenbank gespeichert.',
  },
  {
    question: 'Wo finde ich meine Simulationen?',
    answer: 'Nach dem Login zeigt das Dashboard verfugbare Szenarien, laufende Simulationen und abgeschlossene Auswertungen an.',
  },
  {
    question: 'Kann ich die Sprache wechseln?',
    answer: 'Ja. Uber den Sprachschalter kann zwischen Deutsch und Turkisch gewechselt werden. Simulationen konnen zusatzlich mit bilingualer Unterstutzung gestartet werden.',
  },
  {
    question: 'Was passiert mit meinen Antworten?',
    answer: 'Antworten werden der jeweiligen Simulation zugeordnet, damit Verlauf, Dokumentation und Auswertung angezeigt werden konnen. Sie konnen zur Erzeugung von KI-Antworten und Bewertungen an den eingesetzten KI-Dienst ubermittelt werden.',
  },
  {
    question: 'Woran erkenne ich KI-Inhalte?',
    answer: 'Simulationen, Patienten- oder Prufungsantworten, generierte Szenarien und Bewertungen werden mit KI-Unterstutzung erstellt. Sie dienen dem Lernen und sollten fachlich gepruft werden.',
  },
  {
    question: 'Ist PflegeProfi medizinische Beratung?',
    answer: 'Nein. Die Anwendung ist ein Lern- und Trainingswerkzeug. Sie ersetzt keine medizinische Beratung, keine Prufungsordnung und keine fachliche Supervision.',
  },
  {
    question: 'Darf ich echte Patientendaten eingeben?',
    answer: 'Nein. Die Patientensituationen in PflegeProfi sind fiktiv und werden von der KI erzeugt. Bitte geben Sie trotzdem keine echten Namen, Patientendaten, Diagnosen realer Personen oder andere sensiblen Daten Dritter ein.',
  },
  {
    question: 'Wie lange werden meine Daten gespeichert?',
    answer: 'Konto, Simulationen, Gesprächsverläufe, Dokumentationen und Bewertungen werden grundsätzlich höchstens sechs Monate gespeichert, sofern Sie Ihr Konto nicht vorher selbst löschen.',
  },
  {
    question: 'Kann ich mein Konto löschen?',
    answer: 'Ja. Im Dashboard gibt es den Bereich "Konto und Daten löschen". Dadurch werden Ihr Konto und die zugehörigen PflegeProfi-Daten dauerhaft entfernt.',
  },
  {
    question: 'Kann eine KI-Bewertung meine echte Prufung ersetzen?',
    answer: 'Nein. Die Bewertung ist eine Lernhilfe und keine formale Leistungsentscheidung. Verbindlich sind nur die zustandigen Prufungsstellen, Lehrkrafte oder Fachverantwortlichen.',
  },
  {
    question: 'Wie kann ich Datenschutzfragen stellen?',
    answer: 'Die verantwortliche Stelle muss noch im Impressum erganzt werden. Bis dahin sollten Datenschutzanfragen uber die vom Betreiber bereitgestellte Kontaktadresse laufen.',
  },
];

export default function HelpPage() {
  return (
    <LegalPage
      title="Hilfe und FAQ"
      description="Antworten auf typische Fragen zur Nutzung von PflegeProfi."
    >
      <LegalSection title="Schneller Einstieg">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <Badge className="mb-3">1</Badge>
            <p className="font-medium text-foreground">Konto erstellen</p>
            <p className="mt-1">Mit E-Mail und Passwort registrieren.</p>
          </div>
          <div className="rounded-lg border p-4">
            <Badge className="mb-3">2</Badge>
            <p className="font-medium text-foreground">Szenario wählen</p>
            <p className="mt-1">Thema, Schwierigkeit und Simulationstyp festlegen.</p>
          </div>
          <div className="rounded-lg border p-4">
            <Badge className="mb-3">3</Badge>
            <p className="font-medium text-foreground">Feedback nutzen</p>
            <p className="mt-1">Auswertung lesen und gezielt weiteruben.</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Häufige Fragen">
        <div className="divide-y rounded-lg border">
          {faqs.map((item) => (
            <details key={item.question} className="group p-4">
              <summary className="cursor-pointer list-none font-medium text-foreground">
                {item.question}
              </summary>
              <p className="mt-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="Weitere Informationen">
        <p>
          Datenschutz, Cookies und verantwortliche Stelle sind auf den Seiten{' '}
          <Link className="font-medium text-primary hover:underline" href="/datenschutz">Datenschutz</Link>
          {' '}und{' '}
          <Link className="font-medium text-primary hover:underline" href="/impressum">Impressum</Link>
          {' '}zusammengefasst.
        </p>
      </LegalSection>

      <LegalSection title="Grenzen der KI-Unterstützung">
        <ul className="list-disc space-y-2 pl-5">
          <li>KI-Ausgaben konnen unvollständig oder fehlerhaft sein.</li>
          <li>PflegeProfi ist kein Medizinprodukt und kein Diagnosesystem.</li>
          <li>Nutzen Sie die Inhalte als Trainingsimpuls und prüfen Sie fachliche Aussagen mit Lehrmaterial, Praxisanleitung oder Fachverantwortlichen.</li>
          <li>Die Fälle sind fiktiv und KI-generiert; geben Sie trotzdem keine echten Patientendaten oder vertraulichen Informationen ein.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
