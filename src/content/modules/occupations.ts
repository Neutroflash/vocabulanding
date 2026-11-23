import type { LearningModule } from "../types";

const NONE = "no article (Ø)";

export const occupations: LearningModule = {
  id: "occupations",
  title: "Occupations & Jobs",
  grammar: "A / AN + verb to be · Will / Won't",
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
    {
      prompt: "What do you do? I am ___ teacher.",
      options: ["a", "an", "the"],
      answer: 0,
    },

    // Part 2 (María F.). The source has no answer key: these answers are pending teacher review.
    {
      prompt: "Is your cousin ___ architect?",
      options: ["a", "an", NONE],
      answer: 1,
    },
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
    {
      prompt: "My parents are ___ teachers at this university.",
      options: ["a", "an", NONE],
      answer: 2,
    },
    {
      prompt:
        "Clara: Are you ___ university student?\nJose: Yes, I am.\nClara: Great! Are you ___ responsible and organized person?\nJose: Absolutely!",
      options: ["an / an", "a / a", "a / an"],
      answer: 1,
    },
    {
      prompt:
        "Natalie Vertiz isn't ___ ordinary influencer. She is ___ famous fashion content creator.",
      options: ["a / an", "an / a", "an / an"],
      answer: 1,
    },
    {
      prompt: "My cousin works as ___ programmer in ___ international company.",
      options: ["an / a", "a / Ø", "a / an"],
      answer: 2,
    },
    {
      prompt:
        "Ricardo Mendoza is ___ Peruvian comedian and ___ successful entrepreneur.",
      options: ["an / an", "a / a", "a / Ø"],
      answer: 1,
    },
    {
      prompt:
        "My parents are not ___ doctors. My mother is ___ accountant, and my father is ___ lawyer.",
      options: ["a / an / a", "Ø / an / a", "an / a / an"],
      answer: 1,
    },
    {
      prompt:
        "A: Is your aunt ___ actress?\nB: No, she isn't. She is ___ artist.",
      options: ["an / a", "a / an", "an / an"],
      answer: 2,
    },

    // Will / won't + professions (Naomi). Answer key provided by the teachers.
    {
      prompt: "In ten years, I ___ be a doctor and work in a big hospital.",
      options: ["will", "won't", "am"],
      answer: 0,
    },
    {
      prompt:
        "My sister loves cooking, so she ___ be a chef in a nice restaurant.",
      options: ["will", "won't", "is"],
      answer: 0,
    },
    {
      prompt: "I don't like being on airplanes, so I ___ be a pilot.",
      options: ["will", "won't", "aren't"],
      answer: 1,
    },
    {
      prompt: "Next year, Lucas ___ study to become an English teacher.",
      options: ["will", "won't", "isn't"],
      answer: 0,
    },
    {
      prompt: "Camila is afraid of hospitals, so she ___ be a nurse.",
      options: ["will", "won't", "doesn't"],
      answer: 1,
    },
    {
      prompt: "Someday, my brother ___ be a famous engineer and build bridges.",
      options: ["will", "won't", "are"],
      answer: 0,
    },
    {
      prompt:
        "I hate sitting at a desk all day, so I ___ work as an office worker.",
      options: ["will", "won't", "don't"],
      answer: 1,
    },
    {
      prompt:
        "In the future, Valeria ___ be a dentist because she likes helping people smile.",
      options: ["will", "won't", "has"],
      answer: 0,
    },
    {
      prompt: "Mateo doesn't like drawing houses, so he ___ be an architect.",
      options: ["will", "won't", "wasn't"],
      answer: 1,
    },
    {
      prompt:
        "When I finish school, I ___ work as a police officer to help my town.",
      options: ["will", "won't", "am not"],
      answer: 0,
    },
    {
      prompt: "My cousin is very shy with big crowds, so she ___ be an actor.",
      options: ["will", "won't", "isn't"],
      answer: 1,
    },
    {
      prompt: "In ten years, my friends and I ___ have great jobs.",
      options: ["will", "won't", "be"],
      answer: 0,
    },
    {
      prompt: "Diego doesn't enjoy fixing cars, so he ___ be a mechanic.",
      options: ["will", "won't", "didn't"],
      answer: 1,
    },
    {
      prompt:
        "Someday, I ___ be a teacher because I love helping children learn.",
      options: ["will", "won't", "do"],
      answer: 0,
    },
    {
      prompt: "She doesn't want to work in a kitchen, so she ___ be a baker.",
      options: ["will", "won't", "isn't"],
      answer: 1,
    },
  ],

  // Text provided by the teachers. The questions were written for the demo: pending teacher review.
  reading: {
    title: "My Future Job",
    topic: "Jobs, Occupations and My Future",
    level: "5th year of secondary",
    paragraphs: [
      "My name is Alex and I am in 5th year of secondary school. Soon, I will finish school and I need to think about my future.",
      "In the future, I want to have a good job. I like helping people, so I think I want to be a doctor or a teacher. My best friend, Maria, wants to be an engineer because she loves technology and building things.",
      "My parents say that the most important thing is to choose a job that you love. A job is not only about money. It is about feeling happy every day.",
      "In the future, there will be new jobs too. For example, many people will work with computers and artificial intelligence. But some jobs will always be important, like doctors, teachers, and farmers.",
      "I am a little nervous, but I am also excited. I know that if I study hard now, I will have a good future.",
    ],
    questions: [
      {
        prompt: "What year of secondary school is Alex in?",
        options: ["5th year", "3rd year", "1st year"],
        answer: 0,
      },
      {
        prompt: "Why does Alex want to be a doctor or a teacher?",
        options: [
          "Because Alex likes helping people.",
          "Because Alex loves technology.",
          "Because Alex wants a lot of money.",
        ],
        answer: 0,
      },
      {
        prompt: "What does Maria want to be?",
        options: ["An engineer.", "A farmer.", "A doctor."],
        answer: 0,
      },
      {
        prompt: "What is the most important thing for Alex's parents?",
        options: [
          "To choose a job that you love.",
          "To have a lot of money.",
          "To work with computers.",
        ],
        answer: 0,
      },
      {
        prompt: "Which jobs will always be important?",
        options: [
          "Doctors, teachers and farmers.",
          "Engineers and pilots.",
          "Only jobs with computers.",
        ],
        answer: 0,
      },
      {
        prompt: "How does Alex feel about the future?",
        options: ["A little nervous, but excited.", "Very sad.", "Bored."],
        answer: 0,
      },
    ],
  },
};
