import { LegalPage, LegalSection } from '@/components/legal-page';

export default function ImprintPage() {
  return (
    <LegalPage
      title="Impressum"
      description="Pflichtangaben zum Betreiber von PflegeProfi."
    >
      <LegalSection title="Angaben gemaß § 5 TMG / DDG">
        <div className="rounded-lg border border-dashed p-4">
          <p className="font-medium text-foreground">Noch verbindlich zu ergänzen</p>
          <p>Name/Firma des Betreibers</p>
          <p>Anschrift des Betreibers, falls abweichend von der unten genannten inhaltlich verantwortlichen Person</p>
        </div>
      </LegalSection>

      <LegalSection title="Kontakt">
        <div className="rounded-lg border border-dashed p-4">
          <p>E-Mail des Betreibers: noch zu ergänzen</p>
          <p>Telefon: optional / falls erforderlich</p>
        </div>
      </LegalSection>

      <LegalSection title="Registereintrag">
        <p>Registergericht: München</p>
        <p>Registernummer: VR 206874</p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>Wolfgang Hillenbrand</p>
        <p>Schwanthalerstr. 120</p>
        <p>80339 München</p>
        <p>Deutschland</p>
        <p>
          E-Mail:{' '}
          <a className="font-medium text-primary hover:underline" href="mailto:hillenbrand@euconev.de">
            hillenbrand@euconev.de
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt und Datenschutzkontakt">
        <p>Peter Westebbe</p>
        <p className="text-muted-foreground">E-Mail-Adresse für Datenschutzanfragen bitte noch ergänzen, falls sie veröffentlicht werden soll.</p>
      </LegalSection>

      <LegalSection title="Hinweis zur KI-Nutzung">
        <p>
          PflegeProfi ist ein KI-gestütztes Lern- und Simulationstool. Die Inhalte dienen der Prüfungsvorbereitung und ersetzen keine medizinische Beratung, keine verbindliche Prüfungsentscheidung und keine fachliche Supervision.
        </p>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Dieses Impressum wurde anhand der bereitgestellten Angaben erstellt und ersetzt keine Rechtsberatung. Bitte prüfen, ob Betreibername, vertretungsberechtigte Person und Kontaktadresse vollständig angegeben sind.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
