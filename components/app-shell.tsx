import { ArrowRight, Brain, CalendarDays, Database, Flame, GraduationCap, Headphones, Server, Sparkles } from "lucide-react";
import { LessonWorkspace } from "@/components/lesson-workspace";
import type { LessonBundle } from "@/lib/lesson-types";
import type { Messages } from "@/lib/i18n/messages";

type AppShellProps = {
  overview: {
    totalDays: number;
    totalVocabulary: number;
    totalGrammar: number;
    totalListening: number;
    totalReading: number;
    totalWriting: number;
    totalSpeaking: number;
  };
  bundle: LessonBundle;
  basePath?: string;
  savedBlocks?: Record<string, boolean>;
  persistBlocks?: boolean;
  aiAssist?: Messages["aiAssist"];
  aiCreditCost?: number;
};

export function AppShell({
  overview,
  bundle,
  basePath = "/day",
  savedBlocks = {},
  persistBlocks = false,
  aiAssist,
  aiCreditCost = 1
}: AppShellProps) {
  const stats = [
    ["Days", overview.totalDays],
    ["Words", overview.totalVocabulary],
    ["Grammar", overview.totalGrammar],
    ["Listening", overview.totalListening],
    ["Reading", overview.totalReading],
    ["Writing", overview.totalWriting],
    ["Speaking", overview.totalSpeaking]
  ];

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/8 px-5 py-3 backdrop-blur">
          <a href="/" className="flex items-center gap-3">
            <div className="rounded-full bg-cyan-300 p-2 text-slate-950">
              <GraduationCap size={22} />
            </div>
            <span className="text-lg font-black">KAM CLB9 Coach</span>
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Server size={16} />
            Next.js Web + SQLite + JSON Curriculum
          </div>
        </nav>

        <header className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -bottom-24 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={16} />
                180-day self-contained IELTS General path
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
                Build your CLB9 routine inside one app.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Daily lessons, vocabulary, grammar, listening scripts with browser speech, reading passages, writing prompts,
                speaking questions, quizzes, and local real photos are all generated into JSON and served by the app.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`${basePath}/${bundle.dailyLesson.day}#lesson`} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-slate-950">
                  Start Day {bundle.dailyLesson.day} <ArrowRight size={18} />
                </a>
                <a href="/dashboard/language" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 font-bold text-white">
                  Language dashboard
                </a>
                <a href="/language" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 font-bold text-white">
                  Learning Dashboard
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard icon={<CalendarDays />} label="Study Plan" value="6 Months" detail="2 hours per day" />
            <MetricCard icon={<Database />} label="Local Content" value={`${overview.totalVocabulary.toLocaleString()} Words`} detail="No external resource required" />
            <MetricCard icon={<Headphones />} label="Listening" value="Browser TTS" detail="Scripts and questions included" />
          </div>
        </header>

        <section className="my-8 grid gap-3 md:grid-cols-7">
          {stats.map(([label, value]) => (
            <div key={label} className="glass rounded-3xl p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black">{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-3">
          <FeatureCard icon={<Flame />} title="Streak-first routine" text="A daily checklist keeps the exact two-hour plan clear: vocabulary, listening, reading, writing, and speaking." />
          <FeatureCard icon={<Brain />} title="CLB9 skill coverage" text="Each day combines IELTS-specific language input with output practice and quick checks." />
          <FeatureCard icon={<Database />} title="JSON database" text="All curriculum files live in content/*.json and can later move to PostgreSQL without redesigning the app." />
        </section>

        <div id="lesson">
          <LessonWorkspace
            bundle={bundle}
            totalDays={overview.totalDays}
            basePath={basePath}
            savedBlocks={savedBlocks}
            persistBlocks={persistBlocks}
            aiAssist={aiAssist}
            aiCreditCost={aiCreditCost}
          />
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-5 inline-flex rounded-2xl bg-white/10 p-3 text-cyan-200">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <h2 className="mt-1 text-3xl font-black">{value}</h2>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </article>
  );
}
