import { prisma } from '@/lib/db';
import { getGermanSearchVariants, normalizeGermanSearchText } from '@/lib/text-normalization';

/**
 * Simple keyword-based retrieval from handbook sections.
 * Searches title, content, and keywords for matching terms.
 * Later upgradeable to pgvector semantic search.
 */
export async function retrieveHandbookContext(
  query: string,
  domain: string = 'nursing',
  maxResults: number = 5
): Promise<string> {
  // Extract meaningful words (>3 chars) from query
  const queryWords = query
    .toLocaleLowerCase('de-DE')
    .match(/[\p{L}\p{N}]+/gu)
    ?.flatMap((word) => getGermanSearchVariants(word))
    .filter(w => w.length > 3);

  const uniqueQueryWords = Array.from(new Set(queryWords ?? []));

  if (uniqueQueryWords.length === 0) return '';

  // Build search conditions using PostgreSQL full-text or ILIKE
  const sections = await prisma.handbookSection.findMany({
    where: {
      domain,
      OR: uniqueQueryWords.flatMap(word => [
        { title: { contains: word, mode: 'insensitive' as const } },
        { content: { contains: word, mode: 'insensitive' as const } },
        { keywords: { has: word } },
      ]),
    },
    select: {
      title: true,
      content: true,
      keywords: true,
      partNumber: true,
    },
    take: maxResults * 3, // Fetch more, then rank
  });

  if (sections.length === 0) return '';

  // Rank by relevance (number of matching keywords)
  const ranked = sections.map(section => {
    const text = normalizeGermanSearchText(`${section.title} ${section.content} ${section.keywords.join(' ')}`);
    const score = uniqueQueryWords.reduce((s, word) => {
      const normalizedWord = normalizeGermanSearchText(word);
      return s + (text.includes(normalizedWord) ? 1 : 0);
    }, 0);
    return { ...section, score };
  });

  ranked.sort((a, b) => b.score - a.score);
  const topSections = ranked.slice(0, maxResults);

  // Format as context string
  const contextParts = topSections.map((s, i) => {
    // Truncate long content to avoid prompt bloat
    const truncatedContent = s.content.length > 800
      ? s.content.substring(0, 800) + '...'
      : s.content;
    return `[${i + 1}] ${s.title}:\n${truncatedContent}`;
  });

  return `\nFACHWISSEN AUS DEM PFLEGEEXAMEN-HANDBUCH:\n${contextParts.join('\n\n')}`;
}

/**
 * Retrieve handbook context specifically for evaluation.
 * Focuses on assessment criteria and expected knowledge.
 */
export async function retrieveEvaluationContext(
  topic: string,
  domain: string = 'nursing'
): Promise<string> {
  const context = await retrieveHandbookContext(topic, domain, 3);
  if (!context) return '';
  return `\nBEWERTUNGSGRUNDLAGE AUS DEM HANDBUCH:\n${context}`;
}
