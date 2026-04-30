import Link from "next/link";
import { BadgeDollarSign, GraduationCap, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { logoutAction, requestCreditIncreaseAction } from "@/app/resume-builder/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { getCurrentUser, isAdminUser } from "@/lib/resume-builder/auth";
import { getUserAccount, listCreditRequests } from "@/lib/resume-builder/admin";

export async function GlobalTopNav() {
  const locale = await getLocale();
  const m = getMessages(locale);
  const user = await getCurrentUser();
  const account = user ? getUserAccount(user.id) : null;
  const isAdmin = user ? isAdminUser(user) : false;
  const pendingRequests = isAdmin ? listCreditRequests("pending").length : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 font-black">
          <span className="rounded-full bg-cyan-300 p-2 text-slate-950">
            <GraduationCap size={20} />
          </span>
          {m.nav.brand}
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <Link href="/dashboard" className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15 md:px-4">
            {m.nav.hub}
          </Link>
          <Link href="/dashboard/work" className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15 md:px-4">
            {m.nav.workResumes}
          </Link>
          <Link href="/dashboard/study" className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15 md:px-4">
            {m.nav.studyResumes}
          </Link>
          <Link href="/dashboard/language" className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15 md:px-4">
            {m.nav.languageLearning}
          </Link>
          {user && (
            <Link href="/targets" className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15 md:px-4">
              {m.nav.targets}
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-cyan-100 hover:bg-cyan-300/20">
              <ShieldCheck size={15} /> {m.nav.admin}{" "}
              {pendingRequests > 0 && (
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs text-slate-950">{pendingRequests}</span>
              )}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher current={locale} ariaLabel={m.langSwitcher.label} />
          {user && account ? (
            <>
              <div className="flex items-center overflow-hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100">
                <span className="px-4 py-2">
                  {m.nav.creditsPrefix} {account.credits}
                </span>
                <details className="group relative">
                  <summary
                    className="flex h-full cursor-pointer list-none items-center gap-1 border-s border-cyan-300/20 bg-cyan-300 px-3 py-2 font-black text-slate-950 hover:bg-cyan-200"
                    title={m.nav.requestCreditsSummary}
                  >
                    <BadgeDollarSign size={15} /> +
                  </summary>
                  <form
                    action={requestCreditIncreaseAction}
                    className="absolute end-0 z-50 mt-3 w-80 rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl"
                  >
                    <p className="font-black text-white">{m.nav.requestCreditsTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{m.nav.requestCreditsHelp}</p>
                    <label className="mt-3 block">
                      <span className="text-xs font-bold text-slate-300">{m.nav.amount}</span>
                      <input
                        name="amount"
                        type="number"
                        min={1}
                        max={1000}
                        defaultValue={10}
                        required
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                    <label className="mt-3 block">
                      <span className="text-xs font-bold text-slate-300">{m.nav.message}</span>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder={m.nav.messagePlaceholder}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                    <button className="mt-3 w-full rounded-2xl bg-cyan-300 px-4 py-2 font-black text-slate-950" type="submit">
                      {m.nav.sendRequest}
                    </button>
                  </form>
                </details>
              </div>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white hover:bg-white/15 [&::-webkit-details-marker]:hidden">
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950"
                    aria-hidden
                  >
                    {(user.name || user.email).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[10rem] truncate">{user.name || user.email}</span>
                  <UserRound size={16} className="shrink-0 text-cyan-200" />
                </summary>
                <div className="absolute end-0 z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl">
                  <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                    <UserRound size={16} className="text-cyan-200" /> {m.nav.profile}
                  </Link>
                  <Link href="/security" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                    <ShieldCheck size={16} className="text-cyan-200" /> {m.nav.security}
                  </Link>
                  <form action={logoutAction} className="mt-1 border-t border-white/10 pt-2">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-bold text-slate-200 hover:bg-white/10"
                    >
                      <LogOut size={16} /> {m.nav.signOut}
                    </button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
              <LogIn size={16} /> {m.nav.signIn}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
