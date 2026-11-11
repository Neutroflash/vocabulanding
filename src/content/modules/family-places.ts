import type { LearningModule } from "../types";

export const familyPlaces: LearningModule = {
  id: "family-places",
  title: "Family Members & Places",
  grammar: "This, that, these, those + in, on, at",
  emoji: "🏡",
  color: "#0fa3a3",
  colorDark: "#0b7c7c",

  vocab: [
    // From the teachers' content bank.
    { word: "mother", emoji: "👩" },
    { word: "father", emoji: "👨" },
    { word: "park", emoji: "🏞️" },
    { word: "hospital", emoji: "🏥" },
    // Added for the demo so the games have enough words. Pending teacher review.
    { word: "grandmother", emoji: "👵" },
    { word: "grandfather", emoji: "👴" },
    { word: "school", emoji: "🏫" },
    { word: "beach", emoji: "🏖️" },
  ],

  questions: [
    // Base set (answer key provided by the teachers).
    { prompt: "___ is my mother.", hint: "near", options: ["This", "That", "Those"], answer: 0 },
    { prompt: "My father works ___ a hospital.", options: ["in", "on", "at"], answer: 2 },
    { prompt: "The children are ___ the park.", options: ["at", "in", "by"], answer: 1 },

    // Added for the demo: the source only has three questions for this module. Pending teacher review.
    { prompt: "___ are my cousins.", hint: "far", options: ["These", "Those", "That"], answer: 1 },
    { prompt: "___ is my grandfather.", hint: "far", options: ["This", "These", "That"], answer: 2 },
    { prompt: "___ are my sisters.", hint: "near", options: ["These", "This", "That"], answer: 0 },
    { prompt: "The books are ___ the table.", options: ["in", "on", "at"], answer: 1 },
    { prompt: "We live ___ Lima.", options: ["in", "on", "at"], answer: 0 },
    { prompt: "My sister is ___ school right now.", options: ["on", "of", "at"], answer: 2 },
    { prompt: "The family photo is ___ the wall.", options: ["on", "in", "at"], answer: 0 },
  ],
};
