import { LegalPage, LegalSection } from '@/components/legal-page';

export default function ImprintPage() {
  return (
    <LegalPage
      title="Impressum"
      description="Pflichtangaben zum Betreiber von PflegeProfi."
    >
      <LegalSection title="Angaben gemaß § 5 TMG / DDG">
        <p>EUCON e.V.</p>
        <p>Schwanthalerstr. 120</p>
        <p>80339 München</p>
        <p>Deutschland</p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{' '}
          <a className="font-medium text-primary hover:underline" href="mailto:hillenbrand@euconev.de">
            hillenbrand@euconev.de
          </a>
        </p>
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
      </LegalSection>

      <LegalSection title="Hinweis zur KI-Nutzung">
        <p>
          PflegeProfi ist ein KI-gestütztes Lern- und Simulationstool. Die Inhalte dienen der Prüfungsvorbereitung und ersetzen keine medizinische Beratung, keine verbindliche Prüfungsentscheidung und keine fachliche Supervision.
        </p>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Dieses Impressum wurde anhand der bereitgestellten Angaben erstellt und ersetzt keine Rechtsberatung.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
