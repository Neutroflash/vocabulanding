"use server";

import { revalidatePath } from "next/cache";
import { getModule } from "@/content";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { roundSizeFor, scoreRound } from "@/lib/choice";
import { getCurrentUser } from "@/lib/dal";

export type SaveResult = { ok: true; score: number } | { ok: false; error: string };

type ChoiceInput = {
  moduleId: string;
  /** Answers in the order given: question index and chosen option index, both from the content file. */
  answers: { q: number; o: number }[];
  durationSec: number;
};

const INVALID: SaveResult = { ok: false, error: "This round could not be saved." };

/** Saves a finished "Fill in the blank" round. The score is recomputed here from the answers. */
export async function saveChoiceAttempt(input: ChoiceInput): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return { ok: false, error: "Your session expired. Log in again." };
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

  const duration = Number.isFinite(input.durationSec) ? Math.round(input.durationSec) : 0;

  await db.insert(attempts).values({
    userId: user.id,
    moduleId: learningModule.id,
    game: "choice",
    score: round.score,
    correct: round.correct,
    total: roundSize,
    maxStreak: round.maxStreak,
    heartsLeft: Math.max(round.heartsLeft, 0),
    durationSec: Math.min(Math.max(duration, 0), 3600),
  });

  revalidatePath("/learn");
  revalidatePath("/teacher");
  return { ok: true, score: round.score };
}
