import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Settings2 } from "lucide-react";
import { saveOptionSetAction } from "../../actions";
import { getCurrentUser, isAdminUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { listOptionSetRecords } from "@/lib/resume-builder/options";

type OptionsAdminPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function OptionsAdminPage({ searchParams }: OptionsAdminPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/dashboard");

  const locale = await getLocale();
  const m = getMessages(locale);
  const o = m.adminOptions;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  const { saved, error } = await searchParams;
  const optionSets = listOptionSetRecords();

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            <BackIcon size={16} /> {o.backAdmin}
          </Link>
          <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">{o.badge}</span>
        </div>

        <header className="glass rounded-[2.5rem] p-6 md:p-8">
          <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
            <Settings2 />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{o.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black">{o.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{o.intro}</p>
          {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{o.saved}</p>}
          {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{o.error}</p>}
        </header>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {optionSets.map((set) => (
            <form key={set.key} action={saveOptionSetAction} className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
              <input type="hidden" name="key" value={set.key} />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{set.label}</h2>
                  <p className="mt-1 text-xs text-slate-400">{set.key}</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950" type="submit">
                  <Save size={15} /> {o.save}
                </button>
              </div>
              <textarea
                name="values"
                rows={8}
                defaultValue={set.values.join("\n")}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
              />
              <p className="mt-2 text-xs leading-5 text-slate-400">{o.helpLines}</p>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
