import { prisma } from '@/lib/db';

const STOP_WORDS = new Set([
  'aber',
  'alle',
  'auch',
  'auf',
  'aus',
  'bei',
  'bin',
  'bir',
  'bitte',
  'bu',
  'das',
  'der',
  'die',
  'ein',
  'eine',
  'für',
  'habe',
  'ich',
  'ile',
  'ist',
  'kann',
  'mit',
  'nasıl',
  'nach',
  'nicht',
  'oder',
  'sie',
  'und',
  'var',
  'was',
  'wie',
  'wo',
]);

function getSearchTokens(text: string) {
  return Array.from(
    new Set(
      (text ?? '')
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu)
        ?.filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
        .slice(0, 12) ?? [],
    ),
  );
}

export async function getRelevantGlossaryContext(text: string, take = 8) {
  const tokens = getSearchTokens(text);
  if (tokens.length === 0) return '';

  const glossaryTerms = await prisma.glossaryTerm.findMany({
    where: {
      OR: tokens.flatMap((token) => [
        { termDe: { contains: token, mode: 'insensitive' as const } },
        { termTr: { contains: token, mode: 'insensitive' as const } },
        { contextDe: { contains: token, mode: 'insensitive' as const } },
        { contextTr: { contains: token, mode: 'insensitive' as const } },
      ]),
    },
    select: {
      termDe: true,
      termTr: true,
      contextDe: true,
      contextTr: true,
    },
    orderBy: { termDe: 'asc' },
    take,
  });

  if (glossaryTerms.length === 0) return '';

  return `\nGLOSSAR (relevante Treffer aus der Datenbank):\n${glossaryTerms
    .map((term) => {
      const context = [term.contextDe, term.contextTr].filter(Boolean).join(' | ');
      return `- ${term.termDe} = ${term.termTr}${context ? ` (${context})` : ''}`;
    })
    .join('\n')}`;
}
