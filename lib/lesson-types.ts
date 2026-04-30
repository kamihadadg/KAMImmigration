export type SkillLevel = "B1-B2" | "B2" | "B2-C1";

export type StudyBlock = {
  label: string;
  minutes: number;
};

export type DailyLesson = {
  day: number;
  title: string;
  level: SkillLevel;
  target: string;
  image: string;
  estimatedMinutes: number;
  sections: {
    vocabulary: number[];
    grammar: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    quiz: number;
  };
  plan: StudyBlock[];
};

export type VocabularyItem = {
  id: number;
  day: number;
  word: string;
  meaningFa: string;
  pronunciation: string;
  definitionEn: string;
  topic: string;
  level: SkillLevel;
  image: string;
  example: string;
  translationFa: string;
  collocations: string[];
  synonyms: string[];
  quiz: {
    question: string;
    options: string[];
    answer: string;
  };
};

export type GrammarLesson = {
  id: number;
  day: number;
  title: string;
  level: SkillLevel;
  image: string;
  explanationFa: string;
  structure: string;
  examples: Array<{ en: string; fa: string }>;
  commonMistakes: Array<{ wrong: string; correct: string; reasonFa: string }>;
  exercise: {
    instruction: string;
    sampleAnswer: string;
  };
};

export type PracticeQuestion = {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  explanationFa?: string;
};

export type ListeningLesson = {
  id: number;
  day: number;
  title: string;
  level: SkillLevel;
  image: string;
  audioMode: "browser-tts";
  script: string;
  questions: PracticeQuestion[];
  vocabularyFocus: string[];
};

export type ReadingLesson = {
  id: number;
  day: number;
  title: string;
  level: SkillLevel;
  image: string;
  text: string;
  questions: PracticeQuestion[];
};

export type WritingTask = {
  id: number;
  day: number;
  type: "Task 1 General" | "Task 2";
  title: string;
  prompt: string;
  checklist: string[];
  band7TipFa: string;
};

export type SpeakingTask = {
  id: number;
  day: number;
  title: string;
  part1: string[];
  part2: {
    cueCard: string;
    prompts: string[];
  };
  part3: string[];
  sampleStarter: string;
};

export type Quiz = {
  id: number;
  day: number;
  title: string;
  questions: PracticeQuestion[];
};

export type LessonBundle = {
  dailyLesson: DailyLesson;
  vocabulary: VocabularyItem[];
  grammar: GrammarLesson;
  listening: ListeningLesson;
  reading: ReadingLesson;
  writing: WritingTask;
  speaking: SpeakingTask;
  quiz: Quiz;
};
