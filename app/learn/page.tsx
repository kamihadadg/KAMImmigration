import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeDollarSign, BookOpen, CheckCircle2, Clock, Home, LockOpen } from "lucide-react";
import { getOverview } from "@/lib/content";
import { getProgressSummary } from "@/lib/learning/progress";
import { getUnlockedLearningDays, getUserAccount, LEARNING_DAY_CREDIT_COST } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const m = getMessages(locale);
  const L = m.learning;

  const [overview, summary] = await Promise.all([getOverview(), Promise.resolve(getProgressSummary(user.id))]);
  const safeNextDay = Math.min(overview.totalDays, summary.nextDay);
  const account = getUserAccount(user.id);
  const unlockedDays = getUnlockedLearningDays(user.id);
  const nextUnlocked = unlockedDays.includes(safeNextDay);
  const canOpenNext = nextUnlocked || account.credits >= LEARNING_DAY_CREDIT_COST;

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/8 px-5 py-3 backdrop-blur">
          <Link href="/" className="inline-flex items-center gap-2 font-black">
            <Home size={18} /> {L.navBrand}
          </Link>
          <Link href="/dashboard/language" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">
            {m.nav.languageLearning}
          </Link>
        </nav>

        <header className="glass rounded-[2.5rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{L.eyebrow}</p>
          <h1 className="mt-3 text-5xl font-black">{L.title}</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            {t(m, "learning.intro", { totalDays: overview.totalDays, cost: LEARNING_DAY_CREDIT_COST })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {canOpenNext ? (
              <Link href={`/language/day/${safeNextDay}`} className="inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950">
                {t(m, "learning.continueDay", { day: safeNextDay })}
              </Link>
            ) : (
              <span className="rounded-full bg-amber-400/10 px-6 py-3 font-black text-amber-100">{t(m, "learning.noCreditsDay", { day: safeNextDay })}</span>
            )}
            <span className="rounded-full bg-cyan-300/10 px-6 py-3 font-black text-cyan-100">{t(m, "learning.creditsLabel", { credits: account.credits })}</span>
          </div>
        </header>

        <section className="my-8 grid gap-5 md:grid-cols-4">
          <Stat icon={<BookOpen />} label={L.statTotalDays} value={overview.totalDays} />
          <Stat icon={<CheckCircle2 />} label={L.statCompleted} value={summary.completedDays} />
          <Stat icon={<Clock />} label={L.statNextLesson} value={safeNextDay} />
          <Stat icon={<LockOpen />} label={L.statUnlocked} value={unlockedDays.length} />
        </section>

        <section className="mb-8 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <BadgeDollarSign className="text-cyan-200" />
            <p className="font-bold text-cyan-100">{t(m, "learning.billingNote", { cost: LEARNING_DAY_CREDIT_COST })}</p>
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">{L.recentProgress}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {summary.rows.slice(-12).reverse().map((row) => (
              <Link key={row.day} href={`/language/day/${row.day}#progress`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="font-bold">{t(m, "learning.dayN", { day: row.day })}</p>
                <p className={row.completed ? "text-sm text-emerald-200" : "text-sm text-slate-400"}>{row.completed ? L.statusCompleted : L.statusInProgress}</p>
                {row.notes && <p className="mt-2 line-clamp-2 text-sm text-slate-300">{row.notes}</p>}
              </Link>
            ))}
            {summary.rows.length === 0 && <p className="text-slate-300">{t(m, "learning.noProgress", { day: safeNextDay })}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-[2rem] p-6">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-4xl font-black">{value}</p>
    </div>
  );
}
