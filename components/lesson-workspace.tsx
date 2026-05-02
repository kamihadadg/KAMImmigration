"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Headphones, Mic2, PenLine, Play, Sparkles, Volume2 } from "lucide-react";
import { AiAssistBubble, type AiAssistLabels, type AssistSection, type AssistTaskKey } from "@/components/ai-assist-bubble";
import type { Messages } from "@/lib/i18n/messages";
import type {
  GrammarLesson,
  LessonBundle,
  ListeningLesson,
  PracticeQuestion,
  Quiz,
  ReadingLesson,
  SpeakingTask,
  VocabularyItem,
  WritingTask
} from "@/lib/lesson-types";

const tabs = ["Vocabulary", "Grammar", "Listening", "Reading", "Writing", "Speaking", "Quiz"] as const;
type Tab = (typeof tabs)[number];
const persianPattern = /[\u0600-\u06FF]/;

function persianTextProps(text: string) {
  const isPersian = persianPattern.test(text);
  return {
    className: isPersian ? "font-fa" : undefined,
    dir: isPersian ? "rtl" : undefined,
    lang: isPersian ? "fa" : undefined
  } as const;
}

function vocabularyContext(item: VocabularyItem): string {
  return [
    `Word: ${item.word}`,
    `Meaning (FA): ${item.meaningFa}`,
    `Pronunciation: ${item.pronunciation}`,
    `Definition: ${item.definitionEn}`,
    `Example: ${item.example}`,
    `Translation (FA): ${item.translationFa}`,
    `Collocations: ${item.collocations.join(", ")}`,
    `Synonyms: ${item.synonyms.join(", ")}`,
    `Quiz Q: ${item.quiz.question}`
  ].join("\n");
}

function grammarContext(g: GrammarLesson): string {
  return [
    `Title: ${g.title}`,
    `Structure: ${g.structure}`,
    `Explanation (FA): ${g.explanationFa}`,
    `Examples:\n${g.examples.map((e) => `${e.en} | ${e.fa}`).join("\n")}`,
    `Common mistakes:\n${g.commonMistakes.map((m) => `${m.wrong} → ${m.correct} (${m.reasonFa})`).join("\n")}`,
    `Exercise: ${g.exercise.instruction}`,
    `Sample: ${g.exercise.sampleAnswer}`
  ].join("\n\n");
}

function listeningContext(l: ListeningLesson): string {
  return [
    `Title: ${l.title}`,
    `Script:\n${l.script}`,
    `Vocabulary focus: ${l.vocabularyFocus.join(", ")}`,
    `Questions:\n${l.questions.map((q) => `${q.id}. ${q.question}`).join("\n")}`
  ].join("\n\n");
}

function readingContext(r: ReadingLesson): string {
  return [`Title: ${r.title}`, `Passage:\n${r.text}`, `Questions:\n${r.questions.map((q) => `${q.id}. ${q.question}`).join("\n")}`].join("\n\n");
}

function writingContext(w: WritingTask): string {
  return [`Type: ${w.type}`, `Title: ${w.title}`, `Prompt:\n${w.prompt}`, `Band-7 tip (FA):\n${w.band7TipFa}`, `Checklist:\n${w.checklist.join("\n")}`].join("\n\n");
}

function speakingContext(s: SpeakingTask): string {
  return [
    `Title: ${s.title}`,
    `Sample starter: ${s.sampleStarter}`,
    `Part 1:\n${s.part1.join("\n")}`,
    `Part 2 cue: ${s.part2.cueCard}`,
    `Part 2 prompts:\n${s.part2.prompts.join("\n")}`,
    `Part 3:\n${s.part3.join("\n")}`
  ].join("\n\n");
}

function quizContext(q: Quiz): string {
  return [
    `Quiz: ${q.title}`,
    q.questions.map((ques) => `${ques.id}. [${ques.type}] ${ques.question}\nOptions: ${(ques.options ?? []).join(" | ")}\nAnswer: ${ques.answer}\nNote: ${ques.explanationFa ?? ""}`).join("\n\n")
  ].join("\n\n");
}

function tasksFor(section: AssistSection, labels: AiAssistLabels): Array<{ key: AssistTaskKey; label: string }> {
  const t = labels.tasks;
  switch (section) {
    case "vocabulary":
      return [
        { key: "vocab_deep", label: t.vocabDeep },
        { key: "more_examples", label: t.moreExamples },
        { key: "explain_simple", label: t.explainSimple }
      ];
    case "grammar":
      return [
        { key: "more_examples", label: t.moreExamples },
        { key: "explain_simple", label: t.explainSimple }
      ];
    case "listening":
      return [
        { key: "listening_help", label: t.listeningHelp },
        { key: "more_examples", label: t.moreExamples },
        { key: "explain_simple", label: t.explainSimple }
      ];
    case "reading":
      return [
        { key: "reading_help", label: t.readingHelp },
        { key: "explain_simple", label: t.explainSimple }
      ];
    case "writing":
      return [
        { key: "writing_ideas", label: t.writingIdeas },
        { key: "more_examples", label: t.moreExamples }
      ];
    case "speaking":
      return [
        { key: "speaking_hints", label: t.speakingHints },
        { key: "more_examples", label: t.moreExamples }
      ];
    case "quiz":
      return [
        { key: "quiz_explain", label: t.quizExplain },
        { key: "explain_simple", label: t.explainSimple }
      ];
    default:
      return [{ key: "explain_simple", label: t.explainSimple }];
  }
}

type PanelAssist = {
  day: number;
  section: AssistSection;
  contextText: string;
  labels: AiAssistLabels;
  creditCost: number;
  tasks: Array<{ key: AssistTaskKey; label: string }>;
};

export function LessonWorkspace({
  bundle,
  totalDays,
  basePath = "/day",
  savedBlocks = {},
  persistBlocks = false,
  aiAssist,
  aiCreditCost = 1
}: {
  bundle: LessonBundle;
  totalDays: number;
  basePath?: string;
  savedBlocks?: Record<string, boolean>;
  persistBlocks?: boolean;
  aiAssist?: Messages["aiAssist"];
  aiCreditCost?: number;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Vocabulary");
  const [jumpDay, setJumpDay] = useState(String(bundle.dailyLesson.day));
  const [checked, setChecked] = useState<Record<string, boolean>>(savedBlocks);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(persistBlocks ? "saved" : "idle");
  const completed = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const day = bundle.dailyLesson.day;
  const previousDay = Math.max(1, day - 1);
  const nextDay = Math.min(totalDays, day + 1);

  const assistOn = Boolean(aiAssist);
  const L = aiAssist;

  function panelAssist(section: AssistSection, contextText: string): PanelAssist | undefined {
    if (!assistOn || !L) return undefined;
    return {
      day,
      section,
      contextText,
      labels: L,
      creditCost: aiCreditCost,
      tasks: tasksFor(section, L)
    };
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  async function updateBlock(label: string, value: boolean) {
    const next = { ...checked, [label]: value };
    setChecked(next);
    if (!persistBlocks) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ day, blocks: next })
      });
      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function vocabArticle(item: VocabularyItem): ReactNode {
    const inner = (
      <>
        <img src={item.image} alt="" className="mb-4 h-28 w-full rounded-2xl object-cover" />
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{item.level}</p>
        <h3 className="mt-2 text-2xl font-black">{item.word}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p lang="fa" className="text-lg text-emerald-200">
            {item.meaningFa}
          </p>
          <span className="rounded-full bg-white/8 px-3 py-1 font-mono text-xs text-slate-300">{item.pronunciation}</span>
          <button
            onClick={() => speak(item.word)}
            className="inline-flex items-center gap-1 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-cyan-200"
            type="button"
          >
            <Volume2 size={14} /> Listen
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{item.definitionEn}</p>
        <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{item.example}</p>
        <p lang="fa" className="mt-2 text-sm leading-6 text-slate-400">
          {item.translationFa}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.collocations.map((collocation) => (
            <span key={collocation} className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
              {collocation}
            </span>
          ))}
        </div>
      </>
    );

    if (assistOn && L) {
      return (
        <AiAssistBubble
          key={item.id}
          day={day}
          section="vocabulary"
          contextText={vocabularyContext(item)}
          labels={L}
          creditCost={aiCreditCost}
          tasks={tasksFor("vocabulary", L)}
        >
          <article className="relative overflow-visible rounded-3xl border border-white/10 bg-slate-950/45 p-5">{inner}</article>
        </AiAssistBubble>
      );
    }

    return (
      <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
        {inner}
      </article>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="glass rounded-[2rem] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/20 p-3 text-cyan-200">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Today&apos;s 2-hour path</p>
            <h2 className="text-xl font-bold">Day {day}</h2>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
            <span>Lesson navigation</span>
            <span>
              {day}/{totalDays}
            </span>
          </div>
          <div className="flex gap-2">
            <a
              aria-disabled={day === 1}
              href={`${basePath}/${previousDay}#lesson`}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                day === 1 ? "pointer-events-none bg-white/5 text-slate-600" : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <ChevronLeft size={16} /> Prev
            </a>
            <a
              aria-disabled={day === totalDays}
              href={`${basePath}/${nextDay}#lesson`}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                day === totalDays ? "pointer-events-none bg-white/5 text-slate-600" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              }`}
            >
              Day {nextDay} <ChevronRight size={16} />
            </a>
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const normalizedDay = Math.min(totalDays, Math.max(1, Number(jumpDay) || 1));
              window.location.href = `${basePath}/${normalizedDay}#lesson`;
            }}
          >
            <input
              min={1}
              max={totalDays}
              value={jumpDay}
              onChange={(event) => setJumpDay(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white outline-none focus:border-cyan-300"
              type="number"
              aria-label="Go to day number"
            />
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950" type="submit">
              Go
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-3">
          {bundle.dailyLesson.plan.map((item) => {
            return (
              <label key={item.label} className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <span>
                  <span className="block font-semibold">{item.label}</span>
                  <span className="text-sm text-slate-400">{item.minutes} minutes</span>
                </span>
                <input
                  className="h-5 w-5 accent-cyan-300"
                  type="checkbox"
                  checked={checked[item.label] ?? false}
                  onChange={(event) => updateBlock(item.label, event.target.checked)}
                />
              </label>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Progress</span>
            <span>{completed}/5 blocks</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-800">
            <div className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all" style={{ width: `${(completed / 5) * 100}%` }} />
          </div>
          {persistBlocks && (
            <p className={`mt-3 text-xs ${saveState === "error" ? "text-red-200" : "text-slate-400"}`}>
              {saveState === "saving" && "Saving checklist..."}
              {saveState === "saved" && "Checklist saved to your account."}
              {saveState === "error" && "Could not save checklist. Try again."}
            </p>
          )}
        </div>
      </aside>

      <div className="glass overflow-hidden rounded-[2rem]">
        <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? "bg-white text-slate-950" : "bg-white/8 text-slate-300 hover:bg-white/15"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "Vocabulary" && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{bundle.vocabulary.map((item) => vocabArticle(item))}</div>}

          {activeTab === "Grammar" && (
            <Panel icon={<BookOpen />} title={bundle.grammar.title} subtitle={bundle.grammar.explanationFa} assist={panelAssist("grammar", grammarContext(bundle.grammar))}>
              <code className="block rounded-2xl bg-slate-950 p-4 text-cyan-200">{bundle.grammar.structure}</code>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {bundle.grammar.examples.map((example) => (
                  <div key={example.en} className="rounded-2xl bg-white/8 p-4">
                    <p className="font-semibold">{example.en}</p>
                    <p className="mt-2 text-sm text-slate-400">{example.fa}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === "Listening" && (
            <Panel
              icon={<Headphones />}
              title={bundle.listening.title}
              subtitle="Browser Text-to-Speech is built in, so no external audio source is required."
              assist={panelAssist("listening", listeningContext(bundle.listening))}
            >
              <button onClick={() => speak(bundle.listening.script)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950">
                <Play size={18} /> Play listening script
              </button>
              <p className="rounded-3xl bg-slate-950/60 p-5 leading-8 text-slate-200">{bundle.listening.script}</p>
              <QuestionList questions={bundle.listening.questions} />
            </Panel>
          )}

          {activeTab === "Reading" && (
            <Panel
              icon={<BookOpen />}
              title={bundle.reading.title}
              subtitle="Read once for gist, once for answers, then review explanations."
              assist={panelAssist("reading", readingContext(bundle.reading))}
            >
              <p className="rounded-3xl bg-slate-950/60 p-5 leading-8 text-slate-200">{bundle.reading.text}</p>
              <QuestionList questions={bundle.reading.questions} />
            </Panel>
          )}

          {activeTab === "Writing" && (
            <Panel icon={<PenLine />} title={`${bundle.writing.type}: ${bundle.writing.title}`} subtitle={bundle.writing.band7TipFa} assist={panelAssist("writing", writingContext(bundle.writing))}>
              <p className="rounded-3xl bg-white/8 p-5 text-lg leading-8">{bundle.writing.prompt}</p>
              <textarea className="mt-5 min-h-64 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-100 outline-none focus:border-cyan-300" placeholder="Write your answer here..." />
              <Checklist items={bundle.writing.checklist} />
            </Panel>
          )}

          {activeTab === "Speaking" && (
            <Panel icon={<Mic2 />} title={bundle.speaking.title} subtitle={bundle.speaking.sampleStarter} assist={panelAssist("speaking", speakingContext(bundle.speaking))}>
              <div className="grid gap-5 lg:grid-cols-3">
                <QuestionCard title="Part 1" items={bundle.speaking.part1} />
                <QuestionCard title="Part 2 Cue Card" items={[bundle.speaking.part2.cueCard, ...bundle.speaking.part2.prompts]} />
                <QuestionCard title="Part 3" items={bundle.speaking.part3} />
              </div>
            </Panel>
          )}

          {activeTab === "Quiz" && (
            <Panel icon={<CheckCircle2 />} title={bundle.quiz.title} subtitle="Choose answers, get an instant score, then review explanations." assist={panelAssist("quiz", quizContext(bundle.quiz))}>
              <QuizRunner questions={bundle.quiz.questions} />
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
}

function Panel({ icon, title, subtitle, children, assist }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode; assist?: PanelAssist }) {
  const body = (
    <>
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-white/10 p-3 text-cyan-200">{icon}</div>
        <div>
          <h2 className="text-3xl font-black">{title}</h2>
          <p className="mt-2 max-w-3xl text-slate-300">{subtitle}</p>
        </div>
      </div>
      {children}
    </>
  );

  if (!assist) {
    return <div className="relative">{body}</div>;
  }

  return (
    <AiAssistBubble day={assist.day} section={assist.section} contextText={assist.contextText} labels={assist.labels} creditCost={assist.creditCost} tasks={assist.tasks}>
      <div className="relative min-h-[100px]">{body}</div>
    </AiAssistBubble>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">
          <CheckCircle2 size={18} /> {item}
        </div>
      ))}
    </div>
  );
}

function QuestionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
      <h3 className="text-xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-3 text-slate-300">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/8 p-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuizRunner({ questions }: { questions: PracticeQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const answeredCount = Object.keys(selected).length;
  const score = questions.reduce((total, question) => total + (selected[question.id] === question.answer ? 1 : 0), 0);
  const isComplete = answeredCount === questions.length;

  return (
    <div className="mt-5">
      <div className="mb-5 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Quiz progress</p>
            <h3 className="text-2xl font-black">
              {score}/{questions.length} correct
            </h3>
          </div>
          <button
            className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
            onClick={() => setSelected({})}
            type="button"
          >
            Reset quiz
          </button>
        </div>
        <div className="mt-4 h-3 rounded-full bg-slate-800">
          <div className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Answered {answeredCount} of {questions.length}. {isComplete ? "Quiz complete. Review the feedback below." : "Pick one option for each question."}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question) => {
          const chosen = selected[question.id];
          const hasAnswered = Boolean(chosen);
          const isCorrect = chosen === question.answer;

          return (
            <article key={question.id} className="rounded-3xl border border-white/10 bg-white/8 p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{question.type}</p>
                  <h3 className="mt-2 text-lg font-bold">
                    {question.id}. {question.question}
                  </h3>
                </div>
                {hasAnswered && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrect ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
                    {isCorrect ? "Correct" : "Review"}
                  </span>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {(question.options ?? []).map((option) => {
                  const isSelected = chosen === option;
                  const isAnswer = question.answer === option;
                  const textProps = persianTextProps(option);
                  const optionState = !hasAnswered
                    ? "border-white/10 bg-slate-950/50 text-slate-200 hover:bg-white/10"
                    : isAnswer
                      ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
                      : isSelected
                        ? "border-rose-300/50 bg-rose-400/15 text-rose-100"
                        : "border-white/10 bg-slate-950/40 text-slate-400";

                  return (
                    <button
                      key={option}
                      {...textProps}
                      className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${textProps.className ?? ""} ${optionState}`}
                      onClick={() => setSelected((current) => ({ ...current, [question.id]: option }))}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="mt-4 rounded-2xl bg-slate-950/60 p-4 text-sm">
                  <p {...persianTextProps(question.answer)} className={`text-emerald-200 ${persianTextProps(question.answer).className ?? ""}`}>
                    Answer: {question.answer}
                  </p>
                  {question.explanationFa && (
                    <p lang="fa" dir="rtl" className="font-fa mt-2 leading-6 text-slate-300">
                      {question.explanationFa}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function QuestionList({ questions }: { questions: Array<{ id: number; question: string; options?: string[]; answer: string; explanationFa?: string }> }) {
  return (
    <div className="mt-5 space-y-4">
      {questions.map((question) => (
        <details key={question.id} className="rounded-3xl border border-white/10 bg-white/8 p-5">
          <summary className="cursor-pointer font-semibold">{question.question}</summary>
          {question.options && (
            <div className="mt-3 flex flex-wrap gap-2">
              {question.options.map((option) => {
                const textProps = persianTextProps(option);

                return (
                  <span key={option} {...textProps} className={`rounded-full bg-slate-950/70 px-3 py-1 text-sm text-slate-300 ${textProps.className ?? ""}`}>
                    {option}
                  </span>
                );
              })}
            </div>
          )}
          <p {...persianTextProps(question.answer)} className={`mt-4 text-emerald-200 ${persianTextProps(question.answer).className ?? ""}`}>
            Answer: {question.answer}
          </p>
          {question.explanationFa && (
            <p lang="fa" dir="rtl" className="font-fa mt-2 text-sm text-slate-400">
              {question.explanationFa}
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
