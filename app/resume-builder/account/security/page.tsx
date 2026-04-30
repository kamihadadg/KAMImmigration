import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Save } from "lucide-react";
import { changePasswordAction } from "../../actions";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";

type SecurityPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function SecurityPage({ searchParams }: SecurityPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const m = getMessages(locale);
  const s = m.security;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;
  const { saved, error } = await searchParams;

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center p-6">
      <section className="glass w-full max-w-xl rounded-[2rem] p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
          <BackIcon size={16} /> {s.backDashboard}
        </Link>
        <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
          <KeyRound />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{s.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black">{s.title}</h1>
        <p className="mt-3 text-slate-300">{t(m, "security.signedInAs", { email: user.email })}</p>

        {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{s.saved}</p>}
        {error === "current" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{s.errorCurrent}</p>}
        {error === "invalid" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{s.errorInvalid}</p>}

        <form action={changePasswordAction} className="mt-6 space-y-4">
          <Field label={s.currentPassword} name="currentPassword" type="password" />
          <Field label={s.newPassword} name="newPassword" type="password" />
          <Field label={s.confirmPassword} name="confirmPassword" type="password" />
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
            <Save size={18} /> {s.submit}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input required name={name} type={type} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300" />
    </label>
  );
}
