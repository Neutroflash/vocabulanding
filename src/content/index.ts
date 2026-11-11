import type { Game } from "@/db/schema";
import { animalsSports } from "./modules/animals-sports";
import { familyPlaces } from "./modules/family-places";
import { occupations } from "./modules/occupations";
import type { GameInfo, LearningModule } from "./types";

export type { ChoiceQuestion, GameInfo, LearningModule, VocabItem } from "./types";

/** Modules in the order they appear on the learning path. */
export const MODULES: LearningModule[] = [occupations, familyPlaces, animalsSports];

/** Games in the order they appear inside each module. */
export const GAMES: GameInfo[] = [
  {
    id: "choice",
    name: "Fill in the blank",
    emoji: "✏️",
    description: "Choose the option that completes the sentence.",
  },
  {
    id: "memory",
    name: "Memory Game",
    emoji: "🃏",
    description: "Match each word with its picture.",
  },
  {
    id: "hangman",
    name: "Hangman",
    emoji: "🔤",
    description: "Guess the word letter by letter.",
  },
];

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id);
}

export function getGame(id: string) {
  return GAMES.find((g) => g.id === (id as Game));
}
