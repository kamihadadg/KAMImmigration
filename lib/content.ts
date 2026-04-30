import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  DailyLesson,
  GrammarLesson,
  LessonBundle,
  ListeningLesson,
  Quiz,
  ReadingLesson,
  SpeakingTask,
  VocabularyItem,
  WritingTask
} from "@/lib/lesson-types";

const contentRoot = join(process.cwd(), "content");

async function readJson<T>(name: string): Promise<T> {
  const raw = await readFile(join(contentRoot, `${name}.json`), "utf8");
  return JSON.parse(raw) as T;
}

export async function getOverview() {
  const [dailyLessons, vocabulary, grammar, listening, reading, writing, speaking] = await Promise.all([
    readJson<DailyLesson[]>("daily-lessons"),
    readJson<VocabularyItem[]>("vocabulary"),
    readJson<GrammarLesson[]>("grammar"),
    readJson<ListeningLesson[]>("listening"),
    readJson<ReadingLesson[]>("reading"),
    readJson<WritingTask[]>("writing"),
    readJson<SpeakingTask[]>("speaking")
  ]);

  return {
    dailyLessons,
    totalDays: dailyLessons.length,
    totalVocabulary: vocabulary.length,
    totalGrammar: grammar.length,
    totalListening: listening.length,
    totalReading: reading.length,
    totalWriting: writing.length,
    totalSpeaking: speaking.length
  };
}

export async function getLessonBundle(day = 1): Promise<LessonBundle> {
  const [dailyLessons, vocabulary, grammar, listening, reading, writing, speaking, quizzes] = await Promise.all([
    readJson<DailyLesson[]>("daily-lessons"),
    readJson<VocabularyItem[]>("vocabulary"),
    readJson<GrammarLesson[]>("grammar"),
    readJson<ListeningLesson[]>("listening"),
    readJson<ReadingLesson[]>("reading"),
    readJson<WritingTask[]>("writing"),
    readJson<SpeakingTask[]>("speaking"),
    readJson<Quiz[]>("quizzes")
  ]);

  const dailyLesson = dailyLessons.find((lesson) => lesson.day === day) ?? dailyLessons[0];

  return {
    dailyLesson,
    vocabulary: vocabulary.filter((item) => dailyLesson.sections.vocabulary.includes(item.id)),
    grammar: grammar.find((item) => item.id === dailyLesson.sections.grammar) ?? grammar[0],
    listening: listening.find((item) => item.id === dailyLesson.sections.listening) ?? listening[0],
    reading: reading.find((item) => item.id === dailyLesson.sections.reading) ?? reading[0],
    writing: writing.find((item) => item.id === dailyLesson.sections.writing) ?? writing[0],
    speaking: speaking.find((item) => item.id === dailyLesson.sections.speaking) ?? speaking[0],
    quiz: quizzes.find((item) => item.id === dailyLesson.sections.quiz) ?? quizzes[0]
  };
}
