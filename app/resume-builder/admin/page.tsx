import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeDollarSign, FileText, KeyRound, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import { resetUserPasswordAction, reviewCreditRequestAction, updateUserAccountAction } from "../actions";
import { DEFAULT_STARTING_CREDITS, listAdminUsers, listCreditRequests } from "@/lib/resume-builder/admin";
import { getCurrentUser, isAdminUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";

type AdminPageProps = {
  searchParams: Promise<{ saved?: string; password?: string; "credit-reviewed"?: string; error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) redirect("/dashboard");

  const locale = await getLocale();
  const m = getMessages(locale);
  const a = m.admin;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  const { saved, password, error, "credit-reviewed": creditReviewed } = await searchParams;
  const users = listAdminUsers();
  const creditRequests = listCreditRequests("pending");
  const totalCredits = users.reduce((sum, item) => sum + item.credits, 0);
  const activeUsers = users.filter((item) => item.status === "active").length;
  const totalResumes = users.reduce((sum, item) => sum + item.resumeCount, 0);

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/8 px-5 py-3 backdrop-blur">
          <Link href="/dashboard" className="inline-flex items-center gap-2 font-black">
            <BackIcon size={18} /> {a.backUserDashboard}
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/options" className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              <Settings2 size={16} /> {a.optionManagement}
            </Link>
            <Link href="/admin/targets?kind=work" className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              {a.resumeTargets}
            </Link>
          </div>
        </nav>

        <header className="glass rounded-[2.5rem] p-6 md:p-8">
          <div className="inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
            <ShieldCheck />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{a.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black">{a.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{t(m, "admin.intro", { credits: DEFAULT_STARTING_CREDITS })}</p>
          {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{a.toastUpdated}</p>}
          {password === "reset" && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{a.toastPasswordReset}</p>}
          {creditReviewed && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{a.toastCreditReviewed}</p>}
          {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{a.toastError}</p>}
        </header>

        <section className="my-8 grid gap-5 md:grid-cols-4">
          <AdminStat icon={<UsersRound />} label={a.statUsers} value={users.length.toString()} />
          <AdminStat icon={<ShieldCheck />} label={a.statActiveUsers} value={activeUsers.toString()} />
          <AdminStat icon={<BadgeDollarSign />} label={a.statTotalCredits} value={totalCredits.toString()} />
          <AdminStat icon={<FileText />} label={a.statResumes} value={totalResumes.toString()} />
        </section>

        <section className="glass mb-8 rounded-[2.5rem] p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{a.creditRequestsTitle}</h2>
              <p className="mt-1 text-sm text-slate-400">{a.creditRequestsHint}</p>
            </div>
            <span className="rounded-full bg-amber-300/15 px-3 py-1 text-sm font-bold text-amber-100">{t(m, "admin.pendingBadge", { count: creditRequests.length })}</span>
          </div>

          <div className="grid gap-4">
            {creditRequests.length === 0 && <p className="rounded-2xl bg-white/5 p-4 text-slate-300">{a.noPendingRequests}</p>}
            {creditRequests.map((request) => (
              <article key={request.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <h3 className="text-xl font-black">{request.userName}</h3>
                    <p className="mt-1 text-sm text-slate-400">{request.userEmail}</p>
                    <p className="mt-3 text-3xl font-black text-cyan-100">{t(m, "admin.creditRequestAmount", { amount: request.amount })}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{request.message || a.noMessage}</p>
                    <p className="mt-2 text-xs text-slate-500">{t(m, "admin.requestedAt", { date: request.createdAt })}</p>
                  </div>
                  <form action={reviewCreditRequestAction} className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                    <input type="hidden" name="requestId" value={request.id} />
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-200">{a.adminNote}</span>
                      <input name="adminNote" placeholder={a.adminNotePlaceholder} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300" />
                    </label>
                    <button name="decision" value="approve" className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                      {a.approve}
                    </button>
                    <button name="decision" value="reject" className="rounded-2xl bg-red-500/20 px-5 py-3 font-black text-red-100" type="submit">
                      {a.reject}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass rounded-[2.5rem] p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{a.usersTitle}</h2>
              <p className="mt-1 text-sm text-slate-400">{a.usersHint}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/options" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950">
                {a.manageDropdownOptions}
              </Link>
              <Link href="/admin/targets?kind=work" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                {a.manageResumeTargets}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {users.map((item) => (
              <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.email}</p>
                      </div>
                      <span className={item.status === "active" ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100" : "rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-100"}>
                        {item.status === "active" ? a.statusActive : a.statusSuspended}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
                      <MiniMetric label={a.miniCredits} value={item.credits} />
                      <MiniMetric label={a.miniPlan} value={item.plan} />
                      <MiniMetric label={a.miniResumes} value={item.resumeCount} />
                      <MiniMetric label={a.miniDownloads} value={item.exportCount} />
                      <MiniMetric label={a.miniUnlockedDays} value={item.unlockedLessons} />
                      <MiniMetric label={a.miniCompletedDays} value={item.completedLessons} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">{t(m, "admin.joinedUpdated", { created: item.createdAt, updated: item.updatedAt })}</p>
                  </div>

                  <form action={updateUserAccountAction} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="userId" value={item.id} />
                    <Field label={a.fieldCurrentCredits} name="credits" type="number" defaultValue={String(item.credits)} />
                    <Field label={a.fieldPlan} name="plan" defaultValue={item.plan} placeholder={a.planPlaceholder} />
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-200">{a.statusLabel}</span>
                      <select
                        name="status"
                        defaultValue={item.status}
                        disabled={item.id === user.id}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:opacity-60"
                      >
                        <option value="active">{a.statusActive}</option>
                        <option value="suspended">{a.statusSuspended}</option>
                      </select>
                    </label>
                    <label className="block md:row-span-2">
                      <span className="text-sm font-semibold text-slate-200">{a.adminNotes}</span>
                      <textarea
                        name="notes"
                        rows={4}
                        defaultValue={item.notes}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                    <button className="inline-flex h-fit items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                      <BadgeDollarSign size={18} /> {a.saveAccount}
                    </button>
                  </form>
                </div>
                <form action={resetUserPasswordAction} className="mt-5 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="userId" value={item.id} />
                  <Field label={a.newPassword} name="newPassword" type="password" placeholder={a.passwordMinPlaceholder} />
                  <Field label={a.confirmPassword} name="confirmPassword" type="password" placeholder={a.passwordRepeatPlaceholder} />
                  <button className="inline-flex h-fit items-center justify-center gap-2 self-end rounded-2xl bg-white px-5 py-3 font-black text-slate-950" type="submit">
                    <KeyRound size={18} /> {a.resetPassword}
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text", placeholder }: { label: string; name: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
