import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/resume-builder/actions";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const locale = await getLocale();
  const m = getMessages(locale);
  const { error } = await searchParams;
  const a = m.auth.login;

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center p-6">
      <section className="glass w-full max-w-md rounded-[2rem] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{a.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black">{a.title}</h1>
        <p className="mt-3 text-slate-300">{a.subtitle}</p>
        {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{a.errorInvalid}</p>}
        <form action={loginAction} className="mt-6 space-y-4">
          <Field label={a.email} name="email" type="email" />
          <Field label={a.password} name="password" type="password" />
          <button className="w-full rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
            {a.submit}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-300">
          {a.noAccount}{" "}
          <Link className="font-bold text-cyan-200" href="/register">
            {a.createOne}
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
