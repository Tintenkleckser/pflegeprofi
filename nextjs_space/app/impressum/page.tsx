import { LegalPage, LegalSection } from '@/components/legal-page';

export default function ImprintPage() {
  return (
    <LegalPage
      title="Impressum"
      description="Pflichtangaben zum Betreiber. Diese Seite muss vor einem öffentlichen Produktivbetrieb vollständig und rechtlich geprüft ergänzt werden."
    >
      <LegalSection title="Angaben gemaß § 5 TMG / DDG">
        <div className="rounded-lg border border-dashed p-4">
          <p className="font-medium text-foreground">Noch verbindlich zu ergänzen</p>
          <p>Name/Firma des Verantwortlichen</p>
          <p>Straße und Hausnummer</p>
          <p>PLZ und Ort</p>
          <p>Land</p>
        </div>
      </LegalSection>

      <LegalSection title="Kontakt">
        <div className="rounded-lg border border-dashed p-4">
          <p>E-Mail: noch zu ergänzen</p>
          <p>Telefon: optional / falls erforderlich</p>
        </div>
      </LegalSection>

      <LegalSection title="Vertretungsberechtigte Person">
        <p>Falls eine Firma, Praxis, Schule oder Organisation Betreiberin ist, muss die vertretungsberechtigte Person hier genannt werden.</p>
      </LegalSection>

      <LegalSection title="Verantwortlich fur den Inhalt">
        <p>Die inhaltlich verantwortliche Person muss noch ergänzt werden.</p>
      </LegalSection>

      <LegalSection title="Datenschutzkontakt">
        <div className="rounded-lg border border-dashed p-4">
          <p>E-Mail fur Datenschutzanfragen: noch zu ergänzen</p>
          <p>Falls ein Datenschutzbeauftragter erforderlich ist, muss dieser hier oder in der Datenschutzerklärung genannt werden.</p>
        </div>
      </LegalSection>

      <LegalSection title="Hinweis zur KI-Nutzung">
        <p>
          PflegeProfi ist ein KI-gestütztes Lern- und Simulationstool. Die Inhalte dienen der Prüfungsvorbereitung und ersetzen keine medizinische Beratung, keine verbindliche Prüfungsentscheidung und keine fachliche Supervision.
        </p>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Dieses Impressum ist ein technischer Platzhalter und keine Rechtsberatung. Vor dem Produktivbetrieb mussen die Angaben vollstandig und rechtlich gepruft sein.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
