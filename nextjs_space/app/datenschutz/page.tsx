import Link from 'next/link';
import { LegalPage, LegalSection } from '@/components/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Datenschutz"
      description="Datenschutzhinweise zu PflegeProfi. Verantwortliche Stelle, Kontaktdaten und Verträge müssen vor dem endgültigen Produktivbetrieb final ergänzt und rechtlich geprüft werden."
    >
      <LegalSection title="Verantwortliche Stelle">
        <p>
          Verantwortlich fur PflegeProfi ist die im{' '}
          <Link href="/impressum" className="font-medium text-primary hover:underline">Impressum</Link>
          {' '}genannte Person oder Organisation.
        </p>
        <div className="rounded-lg border border-dashed p-4">
          <p className="font-medium text-foreground">Noch verbindlich zu ergänzen</p>
          <p>Name/Firma, Anschrift, E-Mail-Adresse, ggf. Datenschutzkontakt und vertretungsberechtigte Person.</p>
        </div>
      </LegalSection>

      <LegalSection title="Zwecke der Verarbeitung">
        <ul className="list-disc space-y-2 pl-5">
          <li>Registrierung, Login und sichere Sitzungsverwaltung.</li>
          <li>Bereitstellung von Lernsimulationen, Prüfungsfragen, Fallbeispielen und Feedback.</li>
          <li>Speicherung des Lernfortschritts, laufender Simulationen, Dokumentationen und Auswertungen fur bis zu sechs Monate.</li>
          <li>Technische Bereitstellung, Fehleranalyse, Missbrauchsprävention und IT-Sicherheit.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Rechtsgrundlagen">
        <p>
          Die konkrete Rechtsgrundlage muss durch den Betreiber festgelegt werden. Naheliegend sind je nach Nutzung:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Art. 6 Abs. 1 lit. b DSGVO fur Konto, Login und Bereitstellung der Lernfunktionen.</li>
          <li>Art. 6 Abs. 1 lit. f DSGVO fur technische Sicherheit, notwendige Protokollierung und Missbrauchsprävention.</li>
          <li>Art. 6 Abs. 1 lit. a DSGVO, falls freiwillige Zusatzfunktionen oder nicht notwendige Verarbeitungen eingeführt werden.</li>
          <li>Art. 9 DSGVO sollte im Regelfall nicht einschlägig sein, weil PflegeProfi mit fiktiven, KI-generierten Fällen arbeitet und keine echten Patientendaten vorgesehen sind.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Welche Daten verarbeitet werden">
        <ul className="list-disc space-y-2 pl-5">
          <li>E-Mail-Adresse und Authentifizierungsdaten fur Registrierung und Login.</li>
          <li>App-Profil mit Nutzer-ID, E-Mail-Adresse, bevorzugter Sprache und Erstellungsdatum.</li>
          <li>Simulationsverlaufe, Eingaben, KI-Antworten, fiktive Dokumentationen und Auswertungen.</li>
          <li>Technische Sitzungsdaten, die fur Anmeldung und sichere Nutzung erforderlich sind.</li>
        </ul>
        <p className="font-medium text-foreground">
          Die Fallbeispiele und Patientensituationen in PflegeProfi sind fiktiv und werden von der KI erzeugt. Bitte geben Sie dennoch keine echten Patientendaten, keine Namen realer Personen und keine sensiblen Gesundheitsdaten Dritter in Freitextfelder ein.
        </p>
      </LegalSection>

      <LegalSection title="Dienste und Empfänger">
        <p>
          PflegeProfi nutzt technische Dienstleister. Diese mussen vor dem Produktivbetrieb vertraglich und datenschutzrechtlich dokumentiert werden.
        </p>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="p-3">Dienst</th>
                <th className="p-3">Zweck</th>
                <th className="p-3">Hinweis</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">Vercel</td>
                <td className="p-3">Hosting und Auslieferung der Web-App</td>
                <td className="p-3">AV-Vertrag/DPA und Serverstandorte prüfen.</td>
              </tr>
              <tr>
                <td className="p-3">Supabase</td>
                <td className="p-3">Authentifizierung und Datenbank</td>
                <td className="p-3">Region, DPA, Subprozessoren und Backup-Löschung dokumentieren.</td>
              </tr>
              <tr>
                <td className="p-3">Mistral AI</td>
                <td className="p-3">Erzeugung von Simulationen, Antworten und Bewertungen</td>
                <td className="p-3">DPA, API-Datenverarbeitung, Aufbewahrung und Drittlandtransfer prüfen.</td>
              </tr>
              <tr>
                <td className="p-3">Chatbase, falls aktiviert</td>
                <td className="p-3">Dynamische Prüfungsbeispiele und Wissensbasis</td>
                <td className="p-3">Nur aufnehmen, wenn tatsächlich produktiv integriert.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="KI-Verarbeitung">
        <p>
          Fur Simulation, Szenarioerstellung, Gesprächsantworten und Auswertung werden Texte serverseitig an einen KI-Dienst übermittelt. Die Patientensituationen sind fiktiv und KI-generiert. Übermittelt werden können Aufgabenstellung, Nutzerantworten, Gesprächsverlauf, fiktive Dokumentationsinhalte und fachliche Kontextauszüge.
        </p>
        <p>
          Die KI-Ausgaben sind Lern- und Trainingshilfen. Sie sind keine medizinische Beratung, keine verbindliche Prüfungsentscheidung und keine Garantie für fachliche Richtigkeit. Nutzerinnen und Nutzer sollten KI-Ausgaben fachlich prüfen.
        </p>
      </LegalSection>

      <LegalSection title="Cookies und lokaler Speicher">
        <p>
          PflegeProfi verwendet notwendige Cookies und lokalen Speicher fur Anmeldung, Sitzungsverwaltung, Sprache, Darstellung und den Datenschutzhinweis. Marketing- oder Werbe-Cookies sind nicht vorgesehen.
        </p>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="p-3">Speicher</th>
                <th className="p-3">Zweck</th>
                <th className="p-3">Kategorie</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">Supabase Auth Cookies</td>
                <td className="p-3">Login, Session und sichere Authentifizierung</td>
                <td className="p-3">Notwendig</td>
              </tr>
              <tr>
                <td className="p-3">Theme/Lang Speicher</td>
                <td className="p-3">Darstellung und Spracheinstellung</td>
                <td className="p-3">Funktional</td>
              </tr>
              <tr>
                <td className="p-3">Cookie-Hinweis</td>
                <td className="p-3">Merkt, dass der Hinweis gelesen wurde</td>
                <td className="p-3">Notwendig</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Rechte der Nutzerinnen und Nutzer">
        <p>
          Betroffene Personen konnen je nach Rechtslage Auskunft, Berichtigung, Loschung, Einschrankung, Datenubertragbarkeit und Widerspruch verlangen. Außerdem kann eine erteilte Einwilligung mit Wirkung fur die Zukunft widerrufen werden.
        </p>
        <p>
          Kontaktweg und Verfahren mussen mit der verantwortlichen Stelle final hinterlegt werden. Anfragen sollten innerhalb der gesetzlichen Frist bearbeitet und dokumentiert werden.
        </p>
      </LegalSection>

      <LegalSection title="Speicherdauer und Löschung">
        <p>
          Simulationsdaten, Interaktionen, fiktive Dokumentationen und Auswertungen werden grundsätzlich höchstens sechs Monate gespeichert, sofern keine frühere Löschung durch die Nutzerin oder den Nutzer erfolgt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Dafür ist ein technischer Löschlauf vorgesehen.
        </p>
        <p>
          Das Nutzerkonto und Profil bleiben bestehen, solange das Konto aktiv genutzt wird. Angemeldete Nutzerinnen und Nutzer können ihr Konto im Dashboard schließen. Dabei werden das Supabase-Auth-Konto und die zugehörigen PflegeProfi-Daten dauerhaft gelöscht: Profil, Simulationen, Gesprächsverläufe, Dokumentationen und Bewertungen.
        </p>
        <p>
          Für technische Backups und Protokolle kann eine zeitversetzte Löschung nach den jeweiligen Löschzyklen der eingesetzten Dienstleister gelten. Diese Fristen sind mit den Dienstleistern zu dokumentieren.
        </p>
      </LegalSection>

      <LegalSection title="EU AI Act Hinweise">
        <p>
          PflegeProfi ist als KI-gestütztes Lern- und Simulationstool gedacht. Die App darf nicht als Medizinprodukt, Diagnosesystem, Therapieempfehlung oder verbindliches Prüfungssystem eingesetzt werden, solange keine gesonderte rechtliche und fachliche Prüfung erfolgt ist.
        </p>
        <p>
          Betreiber sollten die AI-Act-Risikoklassifikation, KI-Kompetenz der verantwortlichen Personen, Transparenzhinweise, menschliche Aufsicht und Grenzen der Nutzung dokumentieren.
        </p>
      </LegalSection>

      <LegalSection title="Noch offen vor Produktivbetrieb">
        <ul className="list-disc space-y-2 pl-5">
          <li>Vollstandiges Impressum mit Verantwortlichem und Kontaktangaben.</li>
          <li>Rechtsgrundlagen je Verarbeitungstatigkeit.</li>
          <li>Auftragsverarbeitungsvertrage fur Hosting, Supabase, KI-Anbieter und ggf. Chatbase.</li>
          <li>Vercel-Umgebungsvariablen fur Kontolöschung und Löschlauf setzen: SUPABASE_SERVICE_ROLE_KEY und CRON_SECRET.</li>
          <li>Verzeichnis der Verarbeitungstatigkeiten und technische/organisatorische Maßnahmen.</li>
          <li>AI-Act-Risikoeinstufung und KI-Transparenz-/Aufsichtskonzept.</li>
          <li>Finale juristische Prufung der Datenschutzerklarung.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
