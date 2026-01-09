import { CANONICAL_STATS } from "../types/statsCatalog";
import type { CanonicalStatKey } from "../types/statsCatalog";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

/**
 * Basic guesser:
 * - exact/synonym match on header tokens
 * - returns null if not confident
 */
export function suggestCanonicalKey(sourceColumnName: string): { key: CanonicalStatKey | null; confidence: number } {
  const col = normalize(sourceColumnName);

  let best: { key: CanonicalStatKey | null; score: number } = { key: null, score: 0 };

  for (const stat of CANONICAL_STATS) {
    for (const syn of stat.synonyms) {
      const synN = normalize(syn);
      // simple scoring:
      // exact include -> higher, partial -> lower
      let score = 0;
      if (col === synN) score = 1.0;
      else if (col.includes(synN)) score = 0.85;
      else if (synN.includes(col) && col.length >= 3) score = 0.6;

      if (score > best.score) best = { key: stat.key, score };
    }
  }

  // threshold
  if (best.score < 0.7) return { key: null, confidence: best.score };
  return { key: best.key, confidence: best.score };
}
