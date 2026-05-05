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
    answer: 'Antworten werden der jeweiligen Simulation zugeordnet, damit Verlauf, Dokumentation und Auswertung angezeigt werden konnen.',
  },
  {
    question: 'Ist PflegeProfi medizinische Beratung?',
    answer: 'Nein. Die Anwendung ist ein Lern- und Trainingswerkzeug. Sie ersetzt keine medizinische Beratung, keine Prufungsordnung und keine fachliche Supervision.',
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
    </LegalPage>
  );
}
