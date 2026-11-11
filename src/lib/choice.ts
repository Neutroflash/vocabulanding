// Rules of the "Fill in the blank" game. Shared by the browser (instant feedback)
// and the server (which recomputes the score before saving it).
import type { ChoiceQuestion } from "@/content/types";

export const ROUND_SIZE = 10;
export const MAX_HEARTS = 3;

export type RoundQuestion = {
  /** Position of the question inside its module. */
  index: number;
  prompt: string;
  hint?: string;
  /** Shuffled options; `index` is the option's position in the content file. */
  options: { index: number; text: string }[];
  answer: number;
};

export type ChoiceRound = { id: string; questions: RoundQuestion[] };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function roundSizeFor(questionCount: number) {
  return Math.min(ROUND_SIZE, questionCount);
}

/** Picks random questions for one round and shuffles their options. */
export function buildRound(questions: ChoiceQuestion[]): ChoiceRound {
  const picked = shuffle(questions.map((question, index) => ({ question, index }))).slice(
    0,
    roundSizeFor(questions.length),
  );
  return {
    id: Math.random().toString(36).slice(2),
    questions: picked.map(({ question, index }) => ({
      index,
      prompt: question.prompt,
      hint: question.hint,
      options: shuffle(question.options.map((text, i) => ({ index: i, text }))),
      answer: question.answer,
    })),
  };
}

/** Points for a correct answer, given the streak it produces: 10, 12, 14… up to 20. */
export function pointsFor(streak: number) {
  return 10 + Math.min(Math.max(streak - 1, 0), 5) * 2;
}

export type RoundScore = {
  score: number;
  correct: number;
  streak: number;
  maxStreak: number;
  heartsLeft: number;
  /** True when every question was answered or the hearts ran out. */
  finished: boolean;
};

/** Scores a round from the list of right/wrong answers given so far. */
export function scoreRound(results: boolean[], roundSize: number): RoundScore {
  let score = 0;
  let correct = 0;
  let streak = 0;
  let maxStreak = 0;
  let heartsLeft = MAX_HEARTS;

  for (const isCorrect of results) {
    if (isCorrect) {
      streak += 1;
      correct += 1;
      score += pointsFor(streak);
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
      heartsLeft -= 1;
    }
  }

  return {
    score,
    correct,
    streak,
    maxStreak,
    heartsLeft,
    finished: heartsLeft <= 0 || results.length >= roundSize,
  };
}

/** Splits an option such as "Ø / an" into the text for each blank ("" for no article). */
export function blankFills(optionText: string): string[] {
  return optionText.split(" / ").map((part) => (part.includes("Ø") ? "" : part));
}

/** The full sentence with its blanks filled in, ready to be read aloud. */
export function completeSentence(prompt: string, optionText: string): string {
  const fills = blankFills(optionText);
  let i = 0;
  return prompt
    .replace(/___/g, () => fills[i++] ?? "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}
