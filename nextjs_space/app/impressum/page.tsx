import { LegalPage, LegalSection } from '@/components/legal-page';

export default function ImprintPage() {
  return (
    <LegalPage
      title="Impressum"
      description="Platzhalter fur die gesetzlich erforderlichen Angaben. Bitte vor Veroffentlichung vollstandig erganzen."
    >
      <LegalSection title="Angaben gemaß § 5 TMG / DDG">
        <div className="rounded-lg border border-dashed p-4">
          <p className="font-medium text-foreground">Noch zu erganzen</p>
          <p>Name/Firma des Verantwortlichen</p>
          <p>Straße und Hausnummer</p>
          <p>PLZ und Ort</p>
          <p>Land</p>
        </div>
      </LegalSection>

      <LegalSection title="Kontakt">
        <div className="rounded-lg border border-dashed p-4">
          <p>E-Mail: noch zu erganzen</p>
          <p>Telefon: optional / falls erforderlich</p>
        </div>
      </LegalSection>

      <LegalSection title="Vertretungsberechtigte Person">
        <p>Falls eine Firma, Praxis, Schule oder Organisation Betreiberin ist, muss die vertretungsberechtigte Person hier genannt werden.</p>
      </LegalSection>

      <LegalSection title="Verantwortlich fur den Inhalt">
        <p>Die inhaltlich verantwortliche Person muss noch erganzt werden.</p>
      </LegalSection>

      <LegalSection title="Hinweis">
        <p>
          Dieses Impressum ist ein technischer Platzhalter und keine Rechtsberatung. Vor dem Produktivbetrieb mussen die Angaben vollstandig und rechtlich gepruft sein.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
