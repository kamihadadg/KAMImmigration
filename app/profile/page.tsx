import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, LogOut, Save, UserRound } from "lucide-react";
import { logoutAction, updateProfileAction } from "@/app/resume-builder/actions";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getUserAiProfileFields } from "@/lib/resume-builder/user-ai-settings";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const m = getMessages(locale);
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  const { saved, error } = await searchParams;

  const ai = getUserAiProfileFields(user.id);

  const dateLocale = locale === "fa" ? "fa-IR" : "en-US";
  const joined = new Date(user.createdAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <main className="soft-grid flex min-h-screen items-center justify-center p-6">
      <section className="glass w-full max-w-xl rounded-[2rem] p-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
          <BackIcon size={16} /> {m.profile.backDashboard}
        </Link>
        <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
          <UserRound size={28} />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{m.profile.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black">{m.profile.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{t(m, "profile.memberSince", { date: joined })}</p>

        {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{m.profile.saved}</p>}
        {error === "invalid" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{m.profile.errorInvalid}</p>}
        {error === "email" && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{m.profile.errorEmail}</p>}

        <form action={updateProfileAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">{m.profile.displayName}</span>
            <input
              name="name"
              type="text"
              required
              defaultValue={user.name}
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">{m.profile.email}</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>

          <div className="border-t border-white/10 pt-5">
            <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-cyan-400/[0.07] to-transparent p-4 shadow-[0_0_40px_-12px_rgba(34,211,238,0.28)] ring-1 ring-cyan-400/15 ring-inset">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{m.profile.aiEyebrow}</p>
              <label className="mt-3 block">
                <span className="text-sm font-semibold text-slate-200">{m.profile.aiProvider}</span>
                <select
                  name="aiProvider"
                  defaultValue={ai.aiProvider}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="auto">{m.profile.aiProviderAuto}</option>
                  <option value="gemini">{m.profile.aiProviderGemini}</option>
                  <option value="openai">{m.profile.aiProviderOpenAI}</option>
                </select>
              </label>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.profile.aiProviderHelp}</p>
              <label className="mt-3 block">
                <span className="text-sm font-semibold text-slate-200">{m.profile.aiModel}</span>
                <input
                  name="aiModel"
                  type="text"
                  defaultValue={ai.aiModel}
                  placeholder={m.profile.aiModelPlaceholder}
                  autoComplete="off"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-200">{m.profile.aiApiKey}</span>
                <input
                  name="aiApiKey"
                  type="password"
                  autoComplete="new-password"
                  placeholder={m.profile.aiApiKeyPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
              {ai.hasStoredApiKey && <p className="mt-2 text-xs text-slate-400">{m.profile.aiKeyStoredHint}</p>}
              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                <input name="clearAiKey" type="checkbox" value="1" className="size-4 rounded border-white/20 bg-slate-950 accent-cyan-300" />
                {m.profile.aiClearKey}
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200"
          >
            <Save size={18} /> {m.profile.save}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:flex-wrap">
          <Link
            href="/security"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15"
          >
            <KeyRound size={18} /> {m.profile.security}
          </Link>
          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm font-black text-slate-200 hover:bg-white/5"
            >
              <LogOut size={18} /> {m.profile.signOut}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
