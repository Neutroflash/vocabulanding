import type { LearningModule } from "../types";

export const animalsSports: LearningModule = {
  id: "animals-sports",
  title: "Animals, Sports & Personal Adjectives",
  grammar: "Adjective + noun · Simple present (he / she / it)",
  emoji: "🦁",
  color: "#f2731d",
  colorDark: "#c4560d",

  vocab: [
    // From the teachers' content bank.
    { word: "strong lion", emoji: "🦁" },
    { word: "basketball", emoji: "🏀" },
    { word: "friendly", emoji: "😊" },
    // Added for the demo from words used in the question bank. Pending teacher review.
    { word: "dolphin", emoji: "🐬" },
    { word: "giraffe", emoji: "🦒" },
    { word: "kangaroo", emoji: "🦘" },
    { word: "volleyball", emoji: "🏐" },
    { word: "tennis", emoji: "🎾" },
  ],

  questions: [
    // Base set (answer key provided by the teachers).
    { prompt: "Basketball is ___ exciting sport.", options: ["an", "a", "the"], answer: 0 },
    { prompt: "My brother ___ football on weekends.", options: ["play", "plays", "playing"], answer: 1 },
    { prompt: "A monkey ___ trees.", options: ["climb", "climbs", "climbing"], answer: 1 },

    // Grammar practice (Alisson). The source has no answer key: these answers are pending teacher review.
    // Part 1: simple present, he / she / it.
    { prompt: "My sister ___ volleyball every Saturday.", options: ["play", "plays", "playing"], answer: 1 },
    { prompt: "A lion ___ meat.", options: ["eat", "eating", "eats"], answer: 2 },
    { prompt: "My father ___ basketball after work.", options: ["watches", "watch", "watching"], answer: 0 },
    { prompt: "A dolphin ___ very fast.", options: ["swim", "swims", "swimming"], answer: 1 },
    { prompt: "She ___ tennis at school.", options: ["play", "playing", "plays"], answer: 2 },
    { prompt: "Dogs ___ loudly at strangers.", options: ["bark", "barks", "barking"], answer: 0 },
    // The source options use the verb "study" here; kept as written.
    { prompt: "He ___ football on Sundays.", options: ["studies", "study", "studying"], answer: 0 },
    { prompt: "My cat ___ on the sofa.", options: ["sleep", "sleeping", "sleeps"], answer: 2 },

    // Part 2: adjective + noun.
    // The source prompt ended in "___ animal", which repeated the noun in every option; shortened here.
    { prompt: "A giraffe is a ___.", options: ["animal tall", "tall animal", "tall animals"], answer: 1 },
    { prompt: "Basketball is an ___ sport.", options: ["exciting", "excited", "excitement"], answer: 0 },
    { prompt: "A panda is a ___ animal.", options: ["cute", "cutely", "cuteness"], answer: 0 },
    { prompt: "My brother is a ___ player.", options: ["talented", "talent", "talenting"], answer: 0 },
    { prompt: "A cheetah is a ___ animal.", options: ["fastly", "fast", "fasterly"], answer: 1 },
    { prompt: "Volleyball is an ___ sport.", options: ["interesting", "interestingly", "interest"], answer: 0 },

    // Part 3: animals, sports and personal adjectives.
    {
      prompt: "My friend is very ___. She always helps other people.",
      options: ["lazy", "friendly", "shyly"],
      answer: 1,
    },
    { prompt: "A turtle ___ slowly.", options: ["move", "moves", "moving"], answer: 1 },
    {
      prompt: "My brother is ___. He practices football every day.",
      options: ["hardworking", "lazy", "careless"],
      answer: 0,
    },
    { prompt: "A kangaroo ___ very high.", options: ["jump", "jumping", "jumps"], answer: 2 },
    { prompt: "She ___ swimming because it is fun.", options: ["likes", "like", "liking"], answer: 0 },
    {
      prompt: "My best friend is a ___ basketball player.",
      options: ["skillfully", "skilled", "skill"],
      answer: 1,
    },
  ],
};
