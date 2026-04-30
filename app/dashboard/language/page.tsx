import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Languages, Trophy } from "lucide-react";
import { DashboardShell } from "../_components/dashboard-shell";
import { ChecklistCard, EmptyState, LearningAction, SectionHeader } from "../_components/dashboard-ui";
import { getOverview } from "@/lib/content";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getProgressSummary } from "@/lib/learning/progress";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";

export default async function LanguageDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const m = getMessages(await getLocale());
  const L = m.workspaceLanguage;
  const c = m.common;

  const [overview, progress] = await Promise.all([getOverview(), Promise.resolve(getProgressSummary(user.id))]);
  const nextDay = Math.min(overview.totalDays, progress.nextDay);
  const progressPercent = Math.round((progress.completedDays / overview.totalDays) * 100);
  const recentProgress = progress.rows.slice(-5).reverse();

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <DashboardShell>
        <header className="glass rounded-[2.5rem] p-6 md:p-8">
          <h1 className="text-3xl font-black md:text-4xl">{L.headerTitle}</h1>
          <p className="mt-2 max-w-3xl text-slate-300">{L.headerSubtitle}</p>
        </header>

        <section className="my-6 grid gap-5 lg:grid-cols-4">
          <div className="glass rounded-[2rem] p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3 text-cyan-200">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-sm text-slate-400">{L.completedDays}</p>
            <h2 className="mt-1 text-2xl font-black">
              {progress.completedDays}/{overview.totalDays}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{t(m, "common.planPercent", { pct: progressPercent })}</p>
          </div>
          <div className="glass rounded-[2rem] p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3 text-violet-200">
              <Clock size={22} />
            </div>
            <p className="text-sm text-slate-400">{L.nextLesson}</p>
            <h2 className="mt-1 text-2xl font-black">{t(m, "workspaceLanguage.dayN", { day: nextDay })}</h2>
            <p className="mt-2 text-sm text-slate-300">{c.continueFromLast}</p>
          </div>
          <div className="glass rounded-[2rem] p-5 lg:col-span-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{c.overallProgress}</span>
              <span>
                {progress.completedDays}/{overview.totalDays}
              </span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </section>

        <section className="glass rounded-[2.5rem] p-6 md:p-8">
          <SectionHeader
            icon={<Languages size={22} />}
            eyebrow={L.sectionEyebrow}
            title={L.sectionTitle}
            text={L.sectionText}
            action={
              <Link href={`/language/day/${nextDay}`} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">
                {t(m, "workspaceLanguage.continueDay", { day: nextDay })}
              </Link>
            }
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <LearningAction icon={<BookOpen />} title={L.actionDailyTitle} text={L.actionDailyText} href={`/language/day/${nextDay}`} />
            <LearningAction icon={<Trophy />} title={L.actionAllTitle} text={L.actionAllText} href="/language" />
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-black">{L.recentNotes}</h3>
            <div className="mt-4 space-y-3">
              {recentProgress.length === 0 && <EmptyState title={L.emptyNotesTitle} text={t(m, "workspaceLanguage.emptyNotesText", { day: nextDay })} />}
              {recentProgress.map((row) => (
                <Link key={row.day} href={`/language/day/${row.day}#progress`} className="block rounded-3xl border border-white/10 bg-slate-950/45 p-4 hover:bg-white/8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{t(m, "learning.dayN", { day: row.day })}</p>
                    <span
                      className={
                        row.completed
                          ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                          : "rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300"
                      }
                    >
                      {row.completed ? m.learning.statusCompleted : m.learning.statusInProgress}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{row.notes || c.noNotesYet}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <ChecklistCard title={L.checklistTitle} items={L.checklistItems} />
        </section>
      </DashboardShell>
    </main>
  );
}
