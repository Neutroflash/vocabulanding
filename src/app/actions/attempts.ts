"use server";

import { revalidatePath } from "next/cache";
import { getModule } from "@/content";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { roundSizeFor, scoreRound } from "@/lib/choice";
import { getCurrentUser } from "@/lib/dal";
import { scoreHangman, wordCountFor } from "@/lib/hangman";
import { pairCountFor, scoreMemory, type Turn } from "@/lib/memory";

export type SaveResult = { ok: true; score: number } | { ok: false; error: string };

type ChoiceInput = {
  moduleId: string;
  /** Answers in the order given: question index and chosen option index, both from the content file. */
  answers: { q: number; o: number }[];
  durationSec: number;
};

const INVALID: SaveResult = { ok: false, error: "This round could not be saved." };
const EXPIRED: SaveResult = { ok: false, error: "Your session expired. Log in again." };

function cleanDuration(value: unknown) {
  const seconds = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
  return Math.min(Math.max(seconds, 0), 3600);
}

/** Saves a finished "Fill in the blank" round. The score is recomputed here from the answers. */
export async function saveChoiceAttempt(input: ChoiceInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return EXPIRED;
  }

  const learningModule = typeof input?.moduleId === "string" ? getModule(input.moduleId) : undefined;
  if (!learningModule || !Array.isArray(input.answers)) return INVALID;

  const roundSize = roundSizeFor(learningModule.questions.length);
  if (input.answers.length === 0 || input.answers.length > roundSize) return INVALID;

  const seen = new Set<number>();
  const results: boolean[] = [];
  for (const answer of input.answers) {
    const question = Number.isInteger(answer?.q) ? learningModule.questions[answer.q] : undefined;
    if (!question || seen.has(answer.q)) return INVALID;
    if (!Number.isInteger(answer.o) || answer.o < 0 || answer.o >= question.options.length) return INVALID;
    // No answers are allowed after the round has already ended.
    if (scoreRound(results, roundSize).finished) return INVALID;
    seen.add(answer.q);
    results.push(answer.o === question.answer);
  }

  const round = scoreRound(results, roundSize);
  if (!round.finished) return INVALID;

  await db.insert(attempts).values({
    userId: user.id,
    moduleId: learningModule.id,
    game: "choice",
    score: round.score,
    correct: round.correct,
    total: roundSize,
    maxStreak: round.maxStreak,
    heartsLeft: Math.max(round.heartsLeft, 0),
    durationSec: cleanDuration(input.durationSec),
  });

  revalidatePath("/learn");
  revalidatePath("/teacher");
  return { ok: true, score: round.score };
}

type MemoryInput = {
  moduleId: string;
  /** Vocabulary indexes of the words dealt in this game. */
  pairs: number[];
  /** Every pair of cards flipped, in order. */
  turns: Turn[];
  durationSec: number;
};

/** Saves a finished Memory Game. The score is recomputed here by replaying the turns. */
export async function saveMemoryAttempt(input: MemoryInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return EXPIRED;

  const learningModule = typeof input?.moduleId === "string" ? getModule(input.moduleId) : undefined;
  if (!learningModule || !Array.isArray(input.pairs) || !Array.isArray(input.turns)) return INVALID;

  const pairCount = pairCountFor(learningModule.vocab.length);
  const validPairs =
    input.pairs.length === pairCount &&
    new Set(input.pairs).size === pairCount &&
    input.pairs.every((i) => Number.isInteger(i) && i >= 0 && i < learningModule.vocab.length);
  if (!validPairs) return INVALID;

  const validTurns =
    input.turns.length > 0 &&
    input.turns.length <= 500 &&
    input.turns.every((t) => Array.isArray(t) && t.length === 2 && t.every((id) => typeof id === "string"));
  if (!validTurns) return INVALID;

  const game = scoreMemory(input.turns, input.pairs);
  if (!game || !game.finished) return INVALID;

  await db.insert(attempts).values({
    userId: user.id,
    moduleId: learningModule.id,
    game: "memory",
    score: game.score,
    correct: game.matches,
    total: pairCount,
    maxStreak: game.maxStreak,
    heartsLeft: Math.max(game.heartsLeft, 0),
    durationSec: cleanDuration(input.durationSec),
  });

  revalidatePath("/learn");
  revalidatePath("/teacher");
  return { ok: true, score: game.score };
}

type HangmanInput = {
  moduleId: string;
  /** Vocabulary indexes of the words in this round, in order. */
  words: number[];
  /** Letters guessed for each word, in order. */
  guesses: string[][];
  durationSec: number;
};

/** Saves a finished Hangman round. The score is recomputed here by replaying the guesses. */
export async function saveHangmanAttempt(input: HangmanInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return EXPIRED;

  const learningModule = typeof input?.moduleId === "string" ? getModule(input.moduleId) : undefined;
  if (!learningModule || !Array.isArray(input.words) || !Array.isArray(input.guesses)) return INVALID;

  const wordCount = wordCountFor(learningModule.vocab.length);
  const validWords =
    input.words.length === wordCount &&
    new Set(input.words).size === wordCount &&
    input.words.every((i) => Number.isInteger(i) && i >= 0 && i < learningModule.vocab.length);
  if (!validWords) return INVALID;

  const validGuesses =
    input.guesses.length > 0 &&
    input.guesses.length <= wordCount &&
    input.guesses.every((g) => Array.isArray(g) && g.length <= 26 && g.every((l) => typeof l === "string"));
  if (!validGuesses) return INVALID;

  const round = scoreHangman(
    input.words.map((i) => learningModule.vocab[i].word),
    input.guesses,
  );
  if (!round || !round.finished) return INVALID;

  await db.insert(attempts).values({
    userId: user.id,
    moduleId: learningModule.id,
    game: "hangman",
    score: round.score,
    correct: round.solved,
    total: wordCount,
    maxStreak: round.maxStreak,
    heartsLeft: Math.max(round.heartsLeft, 0),
    durationSec: cleanDuration(input.durationSec),
  });

  revalidatePath("/learn");
  revalidatePath("/teacher");
  return { ok: true, score: round.score };
}
