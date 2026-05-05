import Link from 'next/link';
import { LegalPage, LegalSection } from '@/components/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Datenschutz"
      description="Vorläufige Datenschutzhinweise. Verantwortliche Stelle, Kontaktdaten und finale Rechtsprufung mussen noch erganzt werden."
    >
      <LegalSection title="Verantwortliche Stelle">
        <p>
          Verantwortlich fur PflegeProfi ist die im{' '}
          <Link href="/impressum" className="font-medium text-primary hover:underline">Impressum</Link>
          {' '}genannte Person oder Organisation. Die Angaben sind noch zu erganzen, bevor die Anwendung produktiv veroffentlicht wird.
        </p>
      </LegalSection>

      <LegalSection title="Welche Daten verarbeitet werden">
        <ul className="list-disc space-y-2 pl-5">
          <li>E-Mail-Adresse und Authentifizierungsdaten fur Registrierung und Login.</li>
          <li>App-Profil mit Nutzer-ID, E-Mail-Adresse, bevorzugter Sprache und Erstellungsdatum.</li>
          <li>Simulationsverlaufe, Eingaben, KI-Antworten, Dokumentationen und Auswertungen.</li>
          <li>Technische Sitzungsdaten, die fur Anmeldung und sichere Nutzung erforderlich sind.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Wo die Daten gespeichert werden">
        <p>
          Authentifizierung erfolgt uber Supabase Auth. App-Daten wie Profil, Simulationen, Interaktionen und Auswertungen werden in einer PostgreSQL-Datenbank gespeichert und uber Prisma verarbeitet.
        </p>
      </LegalSection>

      <LegalSection title="KI-Verarbeitung">
        <p>
          Fur Simulation, Auswertung und Szenarioerstellung werden Inhalte serverseitig an einen KI-Dienst ubermittelt. Dazu konnen Texte aus dem Szenario, Nutzerantworten und Dokumentationsinhalte gehoren. Vor dem produktiven Einsatz sollte der Vertrag zur Auftragsverarbeitung und der genaue Anbieterstandort gepruft und dokumentiert werden.
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
          Betroffene Personen konnen je nach Rechtslage Auskunft, Berichtigung, Loschung, Einschrankung, Datenubertragbarkeit und Widerspruch verlangen. Kontakt und Verfahren mussen mit der verantwortlichen Stelle final hinterlegt werden.
        </p>
      </LegalSection>

      <LegalSection title="Noch offen vor Produktivbetrieb">
        <ul className="list-disc space-y-2 pl-5">
          <li>Vollstandiges Impressum mit Verantwortlichem und Kontaktangaben.</li>
          <li>Rechtsgrundlagen je Verarbeitungstatigkeit.</li>
          <li>Auftragsverarbeitungsvertrage fur Hosting, Supabase und KI-Anbieter.</li>
          <li>Loschkonzept fur Nutzerkonto, Simulationen und KI-Inhalte.</li>
          <li>Finale juristische Prufung der Datenschutzerklarung.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
