import type { Game } from "@/db/schema";

export type VocabItem = {
  /** English word or short phrase, lowercase. */
  word: string;
  /** Emoji used as the picture for this word. */
  emoji: string;
};

export type ChoiceQuestion = {
  /** Sentence with one or more blanks written as "___". "\n" separates dialogue lines. */
  prompt: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  /** Optional clue shown next to the sentence, e.g. "near". */
  hint?: string;
};

export type Reading = {
  title: string;
  /** Topic and school year shown above the title. */
  topic: string;
  level: string;
  paragraphs: string[];
  /** Comprehension questions, asked in this order. `prompt` is a full question, with no blanks. */
  questions: ChoiceQuestion[];
};

export type LearningModule = {
  id: string;
  title: string;
  grammar: string;
  emoji: string;
  /** Main and shadow colors for this module's banner and nodes. */
  color: string;
  colorDark: string;
  vocab: VocabItem[];
  questions: ChoiceQuestion[];
  /** Optional reading with comprehension questions. Modules without one have no Reading game. */
  reading?: Reading;
};

export type GameInfo = {
  id: Game;
  name: string;
  emoji: string;
  description: string;
};
