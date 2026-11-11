import type { LearningModule } from "../types";

const NONE = "no article (Ø)";

export const occupations: LearningModule = {
  id: "occupations",
  title: "Occupations & Jobs",
  grammar: "A / AN + verb to be",
  emoji: "💼",
  color: "#5b4bdb",
  colorDark: "#4335b0",

  vocab: [
    // From the teachers' content bank.
    { word: "teacher", emoji: "🧑‍🏫" },
    { word: "engineer", emoji: "👷" },
    { word: "doctor", emoji: "🧑‍⚕️" },
    { word: "chef", emoji: "🧑‍🍳" },
    { word: "pilot", emoji: "🧑‍✈️" },
    // Added for the demo so the games have enough words. Pending teacher review.
    { word: "artist", emoji: "🧑‍🎨" },
    { word: "programmer", emoji: "🧑‍💻" },
    { word: "firefighter", emoji: "🧑‍🚒" },
  ],

  questions: [
    // Base set (answer key provided by the teachers).
    // The source marks "an" as correct here; "a nurse" is the right form, so the key was fixed.
    { prompt: "She is ___ nurse.", options: ["a", "an", "the"], answer: 0 },
    { prompt: "He is ___ architect.", options: ["an", "a", "the"], answer: 0 },
    { prompt: "What do you do? I am ___ teacher.", options: ["a", "an", "the"], answer: 0 },

    // Part 2 (María F.). The source has no answer key: these answers are pending teacher review.
    { prompt: "Is your cousin ___ architect?", options: ["a", "an", NONE], answer: 1 },
    {
      prompt: "My brothers are ___ students, but my sister is ___ engineer.",
      options: ["Ø / a", "a / an", "Ø / an"],
      answer: 2,
    },
    {
      prompt: "Marco isn't ___ accountant. He is ___ entrepreneur.",
      options: ["a / a", "an / an", "an / a"],
      answer: 1,
    },
    { prompt: "My parents are ___ teachers at this university.", options: ["a", "an", NONE], answer: 2 },
    {
      prompt:
        "Clara: Are you ___ university student?\nJose: Yes, I am.\nClara: Great! Are you ___ responsible and organized person?\nJose: Absolutely!",
      options: ["an / an", "a / a", "a / an"],
      answer: 1,
    },
    {
      prompt: "Natalie Vertiz isn't ___ ordinary influencer. She is ___ famous fashion content creator.",
      options: ["a / an", "an / a", "an / an"],
      answer: 1,
    },
    {
      prompt: "My cousin works as ___ programmer in ___ international company.",
      options: ["an / a", "a / Ø", "a / an"],
      answer: 2,
    },
    {
      prompt: "Ricardo Mendoza is ___ Peruvian comedian and ___ successful entrepreneur.",
      options: ["an / an", "a / a", "a / Ø"],
      answer: 1,
    },
    {
      prompt: "My parents are not ___ doctors. My mother is ___ accountant, and my father is ___ lawyer.",
      options: ["a / an / a", "Ø / an / a", "an / a / an"],
      answer: 1,
    },
    {
      prompt: "A: Is your aunt ___ actress?\nB: No, she isn't. She is ___ artist.",
      options: ["an / a", "a / an", "an / an"],
      answer: 2,
    },
  ],
};
