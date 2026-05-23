export const NURSING_SCOPE_GUARDRAILS = `GRENZE DES SIMULATIONSRAUMS - VERBINDLICH:
- Die lernende Person ist immer Pflegefachkraft, Pflegeauszubildende/r oder Pruefungskandidat/in in der Pflege.
- Die lernende Person darf niemals als Arzt, Aerztin, Assistenzarzt, Mediziner oder Mitglied des aerztlichen Dienstes handeln.
- Erstelle keine Aufgabe, in der die lernende Person aerztliche Diagnosen stellt, Medikamente verordnet, Therapien anordnet, Aufklaerung durchfuehrt oder aerztliche Eingriffe entscheidet.
- Aerztliche Taetigkeiten duerfen nur als Schnittstelle vorkommen: Arzt informieren, Ruecksprache halten, Beobachtungen weitergeben, nach aerztlicher Anordnung handeln.
- Wenn ein Thema nach aerztlicher Entscheidung klingt, formuliere es als pflegerische Beobachtung, Einschaetzung, Kommunikation, Dokumentation, Edukation, Prophylaxe, Pflegeplanung oder Eskalation an den aerztlichen Dienst.
- Der systemPrompt beschreibt ausschliesslich das KI-Gegenueber, also Patient/in, Angehoerige/r, Pflegekolleg/in oder Pruefer/in. Er darf die lernende Person nicht in eine aerztliche Rolle setzen.`;

const OUT_OF_SCOPE_ROLE_PATTERNS = [
  /\b(assistenzarztrolle|arztrolle|rolle\s+(?:eines|einer|als)\s+(?:assistenzarzt(?:es|s)?|assistenzärztin|arzt(?:es|s)?|ärztin|mediziner(?:s)?))\b/i,
  /\b(?:du|sie|kandidat(?:in)?|prüfling|pruefling|lernende(?:r)?|user|nutzer(?:in)?|pflegekraft|pflegefachkraft)\s+(?:bist|sind|spielst|spielen|übernimmst|uebernimmst|übernehmen|uebernehmen|handelst|handeln|arbeitest|arbeiten)\s+(?:als|die\s+rolle\s+eines|die\s+rolle\s+einer)?[^.!?\n]{0,120}\b(?:assistenzarzt(?:es|s)?|assistenzärztin|arzt(?:es|s)?|ärztin|mediziner(?:s)?|aerztlicher dienst|ärztlicher dienst)\b/i,
  /\b(?:als|rolle\s+als)\s+(?:assistenzarzt|assistenzärztin|arzt|ärztin|mediziner)\b/i,
];

export function containsOutOfScopeClinicianRole(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? {});
  return OUT_OF_SCOPE_ROLE_PATTERNS.some((pattern) => pattern.test(text));
}

export function isNursingScopeTemplate(template: {
  titleDe?: string | null;
  titleTr?: string | null;
  descriptionDe?: string | null;
  descriptionTr?: string | null;
  systemPrompt?: string | null;
}) {
  return !containsOutOfScopeClinicianRole([
    template?.titleDe,
    template?.titleTr,
    template?.descriptionDe,
    template?.descriptionTr,
    template?.systemPrompt,
  ].join('\n'));
}
