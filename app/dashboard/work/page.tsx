import Link from "next/link";
import { Copy, Download, FileText, Mail, Plus, Trash2 } from "lucide-react";
import { createResumeAction, deleteResumeAction, duplicateResumeAction } from "@/app/resume-builder/actions";
import { DashboardShell } from "../_components/dashboard-shell";
import {
  BriefcaseIcon,
  ChecklistCard,
  EmptyState,
  ExportGroup,
  SectionHeader,
  StatusCard
} from "../_components/dashboard-ui";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { EXPORT_CREDIT_COST, getUserAccount, RESUME_CREDIT_COST } from "@/lib/resume-builder/admin";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getOptionSets } from "@/lib/resume-builder/options";
import { listResumes } from "@/lib/resume-builder/resumes";

type WorkDashboardProps = {
  searchParams: Promise<{ deleted?: string; error?: string; "credit-requested"?: string }>;
};

export default async function WorkDashboardPage({ searchParams }: WorkDashboardProps) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const m = getMessages(await getLocale());
  const w = m.workspaceJob;
  const c = m.common;

  const { deleted, error, "credit-requested": creditRequested } = await searchParams;
  const all = listResumes(user.id);
  const resumes = all.filter((r) => r.kind === "job");
  const options = getOptionSets();
  const account = getUserAccount(user.id);
  const canExport = account.credits >= EXPORT_CREDIT_COST;
  const canCreateResume = account.credits >= RESUME_CREDIT_COST;

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <DashboardShell>
        <header className="glass rounded-[2.5rem] p-6 md:p-8">
          <h1 className="text-3xl font-black md:text-4xl">{w.headerTitle}</h1>
          <p className="mt-2 max-w-3xl text-slate-300">{w.headerSubtitle}</p>
        </header>

        <section className="my-6 grid gap-5 lg:grid-cols-3">
          <StatusCard icon={<FileText />} label={w.statPackages} value={resumes.length.toString()} detail={w.statPackagesDetail} />
          <StatusCard icon={<Download />} label={w.statExports} value={t(m, "workspaceJob.statExportsValue", { cost: EXPORT_CREDIT_COST })} detail={w.statExportsDetail} />
          <StatusCard icon={<Mail />} label={w.statCredits} value={String(account.credits)} detail={w.statCreditsDetail} />
        </section>

        <section className="glass rounded-[2.5rem] p-6 md:p-8">
          <SectionHeader
            icon={<BriefcaseIcon />}
            eyebrow={w.sectionEyebrow}
            title={w.sectionTitle}
            text={w.sectionText}
            action={
              <Link href="#new-job" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
                {w.newPackage}
              </Link>
            }
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
            <form id="new-job" action={createResumeAction} className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
              <h3 className="text-xl font-black">{w.formTitle}</h3>
              <p className="mt-2 text-sm text-slate-300">{t(m, "workspaceJob.formCreditHint", { cost: RESUME_CREDIT_COST })}</p>
              <label className="mt-5 block">
                <span className="text-sm font-semibold">{w.fieldTitle}</span>
                <input name="title" defaultValue="Software Architect Resume" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">{w.fieldMarket}</span>
                <select name="country" defaultValue="Netherlands" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300">
                  {options.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              {canCreateResume ? (
                <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950" type="submit">
                  <Plus size={18} /> {w.createEdit}
                </button>
              ) : (
                <p className="mt-5 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{w.noCreditsCreate}</p>
              )}
            </form>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{w.savedTitle}</h3>
                  <p className="mt-1 text-sm text-slate-400">{t(m, "workspaceJob.downloadHint", { cost: EXPORT_CREDIT_COST })}</p>
                </div>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">{t(m, "common.totalCount", { count: resumes.length })}</span>
              </div>
              {!canExport && <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{w.lowCreditsDownload}</p>}
              {creditRequested && <p className="mb-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{c.creditRequestSent}</p>}
              {deleted && <p className="mb-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{w.deleted}</p>}
              {error === "no-credits-resume" && <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{w.noCreditsAnother}</p>}
              {error && error !== "no-credits-resume" && <p className="mb-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{c.somethingWrong}</p>}
              <div className="space-y-3">
                {resumes.length === 0 && <EmptyState title={w.emptyTitle} text={w.emptyText} />}
                {resumes.map((resume) => (
                  <article key={resume.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold">{resume.title}</h4>
                        <p className="mt-1 text-sm text-slate-400">{t(m, "workspaceJob.rowMeta", { country: resume.country, updated: c.updated, date: resume.updatedAt })}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950" href={`/resume/editor/${resume.id}`}>
                          {c.edit}
                        </Link>
                        <form action={duplicateResumeAction}>
                          <input type="hidden" name="resumeId" value={resume.id} />
                          <button
                            disabled={!canCreateResume}
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                          >
                            <Copy size={14} /> {c.duplicate}
                          </button>
                        </form>
                        <form action={deleteResumeAction}>
                          <input type="hidden" name="resumeId" value={resume.id} />
                          <button className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-2 text-sm font-bold text-red-100 hover:bg-red-500/25" type="submit">
                            <Trash2 size={14} /> {c.delete}
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <ExportGroup resumeId={resume.id} label={w.labels.cv} type="cv" icon={<FileText size={15} />} canExport={canExport} exportLockedHint={c.noExportCredits} />
                      <ExportGroup resumeId={resume.id} label={w.labels.cover} type="cover-letter" icon={<Mail size={15} />} canExport={canExport} exportLockedHint={c.noExportCredits} />
                      <ExportGroup resumeId={resume.id} label={w.labels.email} type="email" icon={<Download size={15} />} canExport={canExport} exportLockedHint={c.noExportCredits} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <ChecklistCard title={w.checklistTitle} items={w.checklistItems} />
        </section>
      </DashboardShell>
    </main>
  );
}
