import Link from "next/link";
import { ArrowRight, BookOpen, FileText, GraduationCap, Languages } from "lucide-react";
import { DashboardShell } from "./_components/dashboard-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getCurrentUser } from "@/lib/resume-builder/auth";

type HubProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardHubPage({ searchParams }: HubProps) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const { error } = await searchParams;
  const locale = await getLocale();
  const m = getMessages(locale);

  const cards = [
    {
      href: "/dashboard/work",
      title: m.dashboardHub.cardWorkTitle,
      desc: m.dashboardHub.cardWorkDesc,
      icon: <FileText className="text-cyan-200" size={28} />,
      className: "border-cyan-300/25 bg-cyan-300/5 hover:border-cyan-300/40"
    },
    {
      href: "/dashboard/study",
      title: m.dashboardHub.cardStudyTitle,
      desc: m.dashboardHub.cardStudyDesc,
      icon: <GraduationCap className="text-violet-200" size={28} />,
      className: "border-violet-400/25 bg-violet-400/5 hover:border-violet-400/40"
    },
    {
      href: "/dashboard/language",
      title: m.dashboardHub.cardLangTitle,
      desc: m.dashboardHub.cardLangDesc,
      icon: <Languages className="text-emerald-200" size={28} />,
      className: "border-emerald-400/25 bg-emerald-400/5 hover:border-emerald-400/40"
    }
  ] as const;

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <DashboardShell>
        <header className="glass relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative">
            {error === "resume-not-found" && (
              <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">That document was not found. Open the job or academic dashboard to try again.</p>
            )}
            {error === "no-credits-resume" && (
              <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">Not enough credits to duplicate. Request credits from the top bar.</p>
            )}
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{m.dashboardHub.welcomeBack}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">{m.dashboardHub.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{m.dashboardHub.subtitle}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className={`group rounded-[2rem] border p-6 transition ${card.className}`}>
              <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">{card.icon}</div>
              <h2 className="text-2xl font-black">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{card.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-200 group-hover:text-cyan-100">
                {m.dashboardHub.open} <ArrowRight size={16} className={locale === "fa" ? "rotate-180" : ""} />
              </span>
            </Link>
          ))}
        </section>

        <p className="mt-10 text-center text-sm text-slate-500">
          <BookOpen className="mb-1 inline text-slate-400" size={14} />{" "}
          <Link href="/targets" className="font-bold text-cyan-200 hover:underline">
            {m.nav.targets}
          </Link>
        </p>
      </DashboardShell>
    </main>
  );
}
