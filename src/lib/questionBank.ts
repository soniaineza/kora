import { enA } from './bank/enA';
import { enB } from './bank/enB';
import { rwA } from './bank/rwA';
import { rwB } from './bank/rwB';
import { frA } from './bank/frA';
import { frB } from './bank/frB';
import type { LanguageCode, Question } from './bank/types';

export type { LanguageCode, Question };

const BANK: Record<LanguageCode, Question[]> = {
  en: [...enA, ...enB],
  rw: [...rwA, ...rwB],
  fr: [...frA, ...frB],
};

export function getQuestionBank(language: string): Question[] {
  if (language === 'rw' || language === 'fr') return BANK[language];
  return BANK.en;
}

// Deterministic seeded PRNG (mulberry32) so each attempt gets a different but
// stable set of questions, keyed by sessionId / start timestamp.
function seededRandom(seedText: string): () => number {
  const str = String(seedText);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;

  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pick a deterministic sample of `count` unique questions for a given language.
 * No two attempts with different seeds will draw the same questions (unless the
 * bank is smaller than `count`).
 */
export function sampleQuestions(language: string, count: number, seed: string): Question[] {
  const bank = getQuestionBank(language);
  if (count >= bank.length) return shuffle(bank, seededRandom(seed));
  return shuffle(bank, seededRandom(seed)).slice(0, count);
}