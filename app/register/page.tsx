import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/resume-builder/actions";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const locale = await getLocale();
  const m = getMessages(locale);
  const { error } = await searchParams;
  const a = m.auth.register;

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center p-6">
      <section className="glass w-full max-w-md rounded-[2rem] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{a.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black">{a.title}</h1>
        <p className="mt-3 text-slate-300">{a.subtitle}</p>
        {error === "exists" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{a.errorExists}</p>}
        {error === "invalid" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{a.errorInvalid}</p>}
        {error === "bot-check" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{a.errorBot}</p>}
        <form action={registerAction} className="mt-6 space-y-4">
          <input type="hidden" name="issuedAt" value={Date.now()} />
          <label className="hidden">
            {a.honeypotLabel}
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <Field label={a.name} name="name" type="text" />
          <Field label={a.email} name="email" type="email" />
          <Field label={a.password} name="password" type="password" />
          <Field label={a.confirmPassword} name="confirmPassword" type="password" />
          <Field label={a.challenge} name="challenge" type="text" />
          <button className="w-full rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
            {a.submit}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-300">
          {a.alreadyRegistered}{" "}
          <Link className="font-bold text-cyan-200" href="/login">
            {a.signIn}
          </Link>
        </p>
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
