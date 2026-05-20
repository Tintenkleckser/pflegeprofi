export function normalizeGermanSearchText(value: string) {
  return (value ?? '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFKC')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function getGermanSearchForms(value: string) {
  const normalized = normalizeGermanSearchText(value).trim();
  const compact = normalized.replace(/\s+/g, ' ');
  const withoutUmlautE = compact
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u');

  return Array.from(new Set([compact, withoutUmlautE].filter(Boolean)));
}

export function germanSearchIncludes(value: string, query: string) {
  const valueForms = getGermanSearchForms(value);
  const queryForms = getGermanSearchForms(query);

  return queryForms.some((queryForm) =>
    valueForms.some((valueForm) => valueForm.includes(queryForm)),
  );
}

export function getGermanSearchVariants(value: string) {
  const raw = (value ?? '').toLocaleLowerCase('de-DE').trim();
  const forms = getGermanSearchForms(raw);
  const asciiToUmlaut = raw
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/ss/g, 'ß');

  return Array.from(new Set([raw, asciiToUmlaut, ...forms].filter(Boolean)));
}
