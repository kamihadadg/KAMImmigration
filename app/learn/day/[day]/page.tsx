import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getLessonBundle, getOverview } from "@/lib/content";
import { getDayProgress } from "@/lib/learning/progress";
import { getUserAccount, LEARNING_DAY_CREDIT_COST, unlockLearningDay } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { saveLearningProgressAction } from "../../actions";

type LearnDayPageProps = {
  params: Promise<{ day: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function LearnDayPage({ params, searchParams }: LearnDayPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const m = getMessages(locale);
  const D = m.learning.day;

  const { day } = await params;
  const { saved } = await searchParams;
  const selectedDay = Number(day);
  const overview = await getOverview();

  if (!Number.isInteger(selectedDay) || selectedDay < 1 || selectedDay > overview.totalDays) {
    notFound();
  }

  const unlock = unlockLearningDay(user.id, selectedDay);
  if (!unlock.unlocked) {
    const account = getUserAccount(user.id);
    return (
      <main className="soft-grid flex min-h-screen items-center justify-center p-6">
        <section className="glass max-w-2xl rounded-[2.5rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">{D.lockedEyebrow}</p>
          <h1 className="mt-3 text-4xl font-black">{t(m, "learning.day.lockedTitle", { day: selectedDay })}</h1>
          <p className="mt-4 leading-7 text-slate-300">
            {t(m, "learning.day.lockedBody", { cost: LEARNING_DAY_CREDIT_COST, credits: account.credits })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/language" className="rounded-full bg-white px-5 py-3 font-black text-slate-950">
              {D.learningDashboard}
            </Link>
            <Link href="/dashboard/language" className="rounded-full bg-white/10 px-5 py-3 font-bold text-white">
              {D.userDashboard}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const [bundle, progress] = await Promise.all([getLessonBundle(selectedDay), Promise.resolve(getDayProgress(user.id, selectedDay))]);

  return (
    <>
      <section id="progress" className="soft-grid px-4 pt-4 md:px-8 md:pt-8">
        <div className="glass mx-auto max-w-7xl rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{D.progressEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black">{t(m, "learning.day.progressTitle", { day: selectedDay })}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{D.progressHint}</p>
            </div>
            <Link href="/language" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              {D.learningDashboard}
            </Link>
          </div>
          {unlock.charged && (
            <p className="mt-4 rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{t(m, "learning.day.unlockedPaid", { day: selectedDay, cost: LEARNING_DAY_CREDIT_COST })}</p>
          )}
          {!unlock.charged && unlock.cost === 0 && (
            <p className="mt-4 rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{t(m, "learning.day.unlockedFree", { day: selectedDay })}</p>
          )}
          {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{D.saved}</p>}
          <form action={saveLearningProgressAction} className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr_auto] lg:items-end">
            <input type="hidden" name="day" value={selectedDay} />
            <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <input name="completed" type="checkbox" defaultChecked={progress.completed} className="h-5 w-5 accent-cyan-300" />
              <span className="font-semibold">{D.markComplete}</span>
            </label>
            <label>
              <span className="text-sm font-semibold">{D.notes}</span>
              <textarea
                name="notes"
                defaultValue={progress.notes}
                rows={2}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-slate-100 outline-none focus:border-cyan-300"
                placeholder={D.notesPlaceholder}
              />
            </label>
            <button className="rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950" type="submit">
              {D.saveProgress}
            </button>
          </form>
        </div>
      </section>
      <AppShell overview={overview} bundle={bundle} basePath="/learn/day" savedBlocks={progress.blocks} persistBlocks />
    </>
  );
}
