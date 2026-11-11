// Rules of the Memory Game. Shared by the browser and the server,
// which replays the turns to recompute the score before saving it.
import type { VocabItem } from "@/content/types";
import { pointsFor } from "./choice";

export const MEMORY_PAIRS = 6;
export const MEMORY_HEARTS = 5;

export type CardKind = "word" | "picture";

export type MemoryCard = {
  /** "<vocab index>:w" for the word card, "<vocab index>:p" for the picture card. */
  id: string;
  vocabIndex: number;
  kind: CardKind;
  word: string;
  emoji: string;
};

export type MemoryDeck = { id: string; pairs: number[]; cards: MemoryCard[] };
export type Turn = [string, string];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pairCountFor(vocabCount: number) {
  return Math.min(MEMORY_PAIRS, vocabCount);
}

export function cardId(vocabIndex: number, kind: CardKind) {
  return `${vocabIndex}:${kind === "word" ? "w" : "p"}`;
}

function parseCard(id: string) {
  const match = /^(\d+):([wp])$/.exec(id);
  return match ? { vocabIndex: Number(match[1]), kind: match[2] } : null;
}

/** Picks random words and lays out a shuffled deck with a word card and a picture card for each. */
export function buildDeck(vocab: VocabItem[]): MemoryDeck {
  const pairs = shuffle(vocab.map((_, index) => index)).slice(0, pairCountFor(vocab.length));
  const cards = pairs.flatMap((vocabIndex) =>
    (["word", "picture"] as const).map((kind) => ({
      id: cardId(vocabIndex, kind),
      vocabIndex,
      kind,
      word: vocab[vocabIndex].word,
      emoji: vocab[vocabIndex].emoji,
    })),
  );
  return { id: Math.random().toString(36).slice(2), pairs, cards: shuffle(cards) };
}

export type MemoryScore = {
  score: number;
  matches: number;
  streak: number;
  maxStreak: number;
  heartsLeft: number;
  matched: Set<number>;
  /** True when every pair was found or the hearts ran out. */
  finished: boolean;
};

/**
 * Replays the turns of a game. Returns null if any turn is impossible
 * (unknown card, same card twice, a pair already found, or a turn after the end).
 *
 * A miss only costs a heart when it was avoidable: the second card had been seen
 * before, or the partner of the first card had. Blind first guesses are free.
 */
export function scoreMemory(turns: Turn[], pairs: number[]): MemoryScore | null {
  const inDeck = new Set(pairs);
  const matched = new Set<number>();
  const seen = new Set<string>();
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let heartsLeft = MEMORY_HEARTS;

  for (const [a, b] of turns) {
    if (heartsLeft <= 0 || matched.size >= pairs.length) return null;
    const first = parseCard(a);
    const second = parseCard(b);
    if (!first || !second || a === b) return null;
    if (!inDeck.has(first.vocabIndex) || !inDeck.has(second.vocabIndex)) return null;
    if (matched.has(first.vocabIndex) || matched.has(second.vocabIndex)) return null;

    if (first.vocabIndex === second.vocabIndex) {
      matched.add(first.vocabIndex);
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
      score += pointsFor(streak);
    } else {
      const partnerOfFirst = `${first.vocabIndex}:${first.kind === "w" ? "p" : "w"}`;
      if (seen.has(b) || seen.has(partnerOfFirst)) heartsLeft -= 1;
      streak = 0;
    }
    seen.add(a);
    seen.add(b);
  }

  return {
    score,
    matches: matched.size,
    streak,
    maxStreak,
    heartsLeft,
    matched,
    finished: heartsLeft <= 0 || matched.size >= pairs.length,
  };
}
