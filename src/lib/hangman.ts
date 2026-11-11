// Rules of Hangman. Shared by the browser and the server,
// which replays the guesses to recompute the score before saving it.
import type { VocabItem } from "@/content/types";
import { pointsFor } from "./choice";

export const HANGMAN_WORDS = 5;
export const HANGMAN_HEARTS = 3;
/** Wrong letters allowed per word: one for each part of the drawing. */
export const MAX_WRONG = 6;

export type HangmanRound = { id: string; words: number[] };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function wordCountFor(vocabCount: number) {
  return Math.min(HANGMAN_WORDS, vocabCount);
}

/** Picks the random words (as vocabulary indexes) for one round. */
export function buildHangmanRound(vocab: VocabItem[]): HangmanRound {
  return {
    id: Math.random().toString(36).slice(2),
    words: shuffle(vocab.map((_, index) => index)).slice(0, wordCountFor(vocab.length)),
  };
}

export type WordState = {
  /** False if the guesses are impossible: not a single a-z letter, repeated, or made after the word ended. */
  valid: boolean;
  wrong: number;
  solved: boolean;
  failed: boolean;
  finished: boolean;
};

/** Replays the letters guessed for one word. Spaces in the word are given for free. */
export function playWord(word: string, letters: string[]): WordState {
  const needed = new Set(word.replace(/[^a-z]/g, ""));
  const tried = new Set<string>();
  let wrong = 0;
  let found = 0;
  let valid = true;

  for (const letter of letters) {
    const over = found >= needed.size || wrong >= MAX_WRONG;
    if (over || !/^[a-z]$/.test(letter) || tried.has(letter)) {
      valid = false;
      break;
    }
    tried.add(letter);
    if (needed.has(letter)) found += 1;
    else wrong += 1;
  }

  const solved = found >= needed.size;
  const failed = !solved && wrong >= MAX_WRONG;
  return { valid, wrong, solved, failed, finished: solved || failed };
}

export type HangmanScore = {
  score: number;
  solved: number;
  streak: number;
  maxStreak: number;
  heartsLeft: number;
  /** True when every word was played or the hearts ran out. */
  finished: boolean;
};

/**
 * Scores a round from the letters guessed for each word, in order.
 * Returns null if the guesses are impossible. Only the last word may be unfinished.
 */
export function scoreHangman(words: string[], guesses: string[][]): HangmanScore | null {
  if (guesses.length > words.length) return null;

  let score = 0;
  let solved = 0;
  let streak = 0;
  let maxStreak = 0;
  let heartsLeft = HANGMAN_HEARTS;
  let played = 0;

  for (let i = 0; i < guesses.length; i++) {
    if (heartsLeft <= 0) return null;
    const state = playWord(words[i], guesses[i]);
    if (!state.valid) return null;
    if (!state.finished) {
      if (i !== guesses.length - 1) return null;
      break;
    }
    played += 1;
    if (state.solved) {
      solved += 1;
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
      score += pointsFor(streak);
    } else {
      streak = 0;
      heartsLeft -= 1;
    }
  }

  return {
    score,
    solved,
    streak,
    maxStreak,
    heartsLeft,
    finished: heartsLeft <= 0 || played >= words.length,
  };
}
