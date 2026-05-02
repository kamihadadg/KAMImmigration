import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Languages,
  LogIn,
  MapPin,
  Send,
  Sparkles
} from "lucide-react";
import { getOverview } from "@/lib/content";
import { getProgressSummary } from "@/lib/learning/progress";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { DEFAULT_STARTING_CREDITS } from "@/lib/resume-builder/admin";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import type { Locale } from "@/lib/i18n/config";

export default async function Home() {
  const locale = await getLocale();
  const m = getMessages(locale);
  const [overview, user] = await Promise.all([getOverview(), getCurrentUser()]);
  const progress = user ? getProgressSummary(user.id) : null;
  const nextDay = progress ? Math.min(overview.totalDays, progress.nextDay) : null;
  const Forward = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <main className="soft-grid min-h-screen overflow-hidden p-4 pb-16 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="glass relative overflow-hidden rounded-[3rem] p-8 md:p-12">
            <div
              className={`absolute -top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl ${locale === "fa" ? "-left-20" : "-right-20"}`}
            />
            <div
              className={`absolute -bottom-16 h-72 w-72 rounded-full bg-violet-500/18 blur-3xl ${locale === "fa" ? "right-10" : "left-24"}`}
            />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={16} />
                {m.landing.hero.badge}
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.15] tracking-tight md:text-6xl md:leading-[1.08]">{m.landing.hero.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{m.landing.hero.subtitle}</p>
              <nav
                aria-label={m.landing.sectionNavAria}
                className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-sm font-semibold text-slate-400"
              >
                <a href="#pillars" className="transition hover:text-cyan-200">
                  {m.landing.localNav.pillars}
                </a>
                <a href="#language" className="transition hover:text-cyan-200">
                  {m.landing.localNav.language}
                </a>
                <a href="#work" className="transition hover:text-cyan-200">
                  {m.landing.localNav.work}
                </a>
                <a href="#study" className="transition hover:text-cyan-200">
                  {m.landing.localNav.study}
                </a>
              </nav>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200"
                >
                  {m.landing.hero.startFree}
                  <Forward size={18} />
                </Link>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 font-bold text-white hover:bg-white/15"
                >
                  {user ? m.landing.hero.myDashboard : m.landing.hero.haveAccount}
                  <LogIn size={18} />
                </Link>
                <Link
                  href="/targets"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-bold text-cyan-100 hover:bg-cyan-300/20"
                >
                  {m.landing.hero.targets}
                  <Send size={18} />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <TrustChip text={t(m, "landing.trust.starterCredits", { credits: DEFAULT_STARTING_CREDITS })} />
                <TrustChip text={m.landing.trust.creditResume} />
                <TrustChip text={m.landing.trust.creditExportDay} />
                <TrustChip text={m.landing.trust.aiAssist} />
                <TrustChip text={t(m, "landing.trust.clb9Path", { days: overview.totalDays })} />
              </div>
            </div>
          </div>

          <aside className="glass relative flex flex-col justify-between overflow-hidden rounded-[3rem] p-6 md:p-8">
            <div className={`absolute top-20 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl ${locale === "fa" ? "-left-16" : "-right-16"}`} />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-200">{m.landing.sidebar.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-black md:text-3xl">
                {progress
                  ? t(m, "landing.sidebar.progressTitle", { days: progress.completedDays })
                  : m.landing.sidebar.notStartedTitle}
              </h2>
              <p className="mt-2 text-slate-400">
                {progress
                  ? t(m, "landing.sidebar.nextStep", { day: String(nextDay) })
                  : m.landing.sidebar.hint}
              </p>
            </div>
            <div className="relative mt-8 grid gap-3 border-t border-white/10 pt-6">
              <MiniRow
                icon={<Languages className="text-cyan-200" size={20} />}
                title={m.landing.miniRows.languageTitle}
                text={m.landing.miniRows.languageText}
              />
              <MiniRow
                icon={<BriefcaseBusiness className="text-cyan-200" size={20} />}
                title={m.landing.miniRows.workTitle}
                text={m.landing.miniRows.workText}
              />
              <MiniRow
                icon={<MapPin className="text-cyan-200" size={20} />}
                title={m.landing.miniRows.targetsTitle}
                text={m.landing.miniRows.targetsText}
              />
            </div>
            {nextDay && (
              <Link
                href={`/language/day/${nextDay}`}
                className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 font-bold text-white hover:bg-white/15"
              >
                {m.landing.continueLanguage}
                <Forward size={18} />
              </Link>
            )}
          </aside>
        </header>

        <section id="pillars" className="my-14">
          <div className="mb-8 text-center md:text-start">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{m.landing.pillarsIntro.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">{m.landing.pillarsIntro.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400 md:mx-0">{m.landing.pillarsIntro.subtitle}</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <PillarCard
              id="study"
              locale={locale}
              icon={<GraduationCap className="text-emerald-200" size={28} />}
              tone="emerald"
              title={m.landing.pillar.study.title}
              subtitle={m.landing.pillar.study.subtitle}
              bullets={m.landing.pillar.study.bullets}
              href="/resume"
              cta={m.landing.pillar.study.cta}
            />
            <PillarCard
              id="work"
              locale={locale}
              icon={<BriefcaseBusiness className="text-cyan-200" size={28} />}
              tone="cyan"
              title={m.landing.pillar.work.title}
              subtitle={m.landing.pillar.work.subtitle}
              bullets={m.landing.pillar.work.bullets}
              href="/targets"
              cta={m.landing.pillar.work.cta}
            />
            <PillarCard
              id="language"
              locale={locale}
              icon={<Languages className="text-violet-200" size={28} />}
              tone="violet"
              title={m.landing.pillar.language.title}
              subtitle={t(m, "landing.pillar.language.subtitle", { days: overview.totalDays })}
              bullets={m.landing.pillar.language.bullets}
              href={nextDay ? `/language/day/${nextDay}` : "/language"}
              cta={
                progress && nextDay
                  ? t(m, "landing.pillar.language.ctaContinue", { day: String(nextDay) })
                  : m.landing.pillar.language.ctaStart
              }
            />
          </div>
        </section>

        <section className="glass my-14 rounded-[2.5rem] p-8 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{m.landing.journey.eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">{m.landing.journey.title}</h2>
            </div>
            <Link href="/register" className="w-fit rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200">
              {m.landing.journey.register}
            </Link>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {m.landing.journey.steps.map((step) => (
              <JourneyStep key={step.n} n={step.n} title={step.title} text={step.text} />
            ))}
          </ol>
        </section>

        <section className="my-14 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          <div className="glass rounded-[2.5rem] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200">{m.landing.markets.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black">{m.landing.markets.title}</h2>
            <p className="mt-4 leading-7 text-slate-300">{m.landing.markets.subtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MarketTile country={m.landing.markets.nl.country} tag={m.landing.markets.nl.tag} detail={m.landing.markets.nl.detail} />
            <MarketTile country={m.landing.markets.ca.country} tag={m.landing.markets.ca.tag} detail={m.landing.markets.ca.detail} />
            <MarketTile
              country={m.landing.markets.remote.country}
              tag={m.landing.markets.remote.tag}
              detail={m.landing.markets.remote.detail}
            />
            <MarketTile
              country={m.landing.markets.custom.country}
              tag={m.landing.markets.custom.tag}
              detail={m.landing.markets.custom.detail}
            />
          </div>
        </section>

        <section className="glass relative overflow-hidden rounded-[3rem] p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{m.landing.cta.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">{m.landing.cta.title}</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">{m.landing.cta.subtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-8 py-3.5 font-black text-slate-950 hover:bg-cyan-200"
              >
                {user ? m.landing.cta.dashboard : m.landing.cta.register}
                <Forward size={18} />
              </Link>
              <Link
                href="/resume"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-bold text-white hover:bg-white/10"
              >
                {m.landing.cta.resumeBuilder}
                <Forward size={18} />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function TrustChip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-2">
      <CheckCircle2 className="shrink-0 text-emerald-200" size={16} />
      <span>{text}</span>
    </div>
  );
}

function MiniRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="shrink-0 rounded-xl bg-white/10 p-2">{icon}</div>
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function PillarCard({
  id,
  locale,
  icon,
  tone,
  title,
  subtitle,
  bullets,
  href,
  cta
}: {
  id: string;
  locale: Locale;
  icon: React.ReactNode;
  tone: "emerald" | "cyan" | "violet";
  title: string;
  subtitle: string;
  bullets: string[];
  href: string;
  cta: string;
}) {
  const ring =
    tone === "emerald"
      ? "border-emerald-400/20 hover:border-emerald-400/35"
      : tone === "cyan"
        ? "border-cyan-400/20 hover:border-cyan-400/35"
        : "border-violet-400/20 hover:border-violet-400/35";
  const glow =
    tone === "emerald"
      ? "from-emerald-400/10"
      : tone === "cyan"
        ? "from-cyan-400/10"
        : "from-violet-400/10";
  const Forward = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <article id={id} className={`glass group relative overflow-hidden rounded-[2.5rem] border ${ring} p-6 transition md:p-8`}>
      <div
        className={`pointer-events-none absolute -start-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`}
      />
      <div className="relative mb-5 inline-flex rounded-2xl bg-white/10 p-3">{icon}</div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300/90" size={16} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-black text-white hover:bg-white/20"
      >
        {cta}
        <Forward size={16} />
      </Link>
    </article>
  );
}

function JourneyStep({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="backlit-dark-surface relative list-none rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <span className="font-mono text-lg font-black text-cyan-200">{n}</span>
      <h3 className="mt-2 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </li>
  );
}

function MarketTile({ country, tag, detail }: { country: string; tag: string; detail: string }) {
  return (
    <article className="backlit-dark-surface rounded-3xl border border-white/10 bg-slate-950/45 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-black">{country}</p>
        <BookOpen className="text-slate-600" size={18} />
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-violet-200">{tag}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  );
}
