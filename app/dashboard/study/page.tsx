import Link from "next/link";
import { Copy, FileText, GraduationCap, Plus, Trash2 } from "lucide-react";
import { createAcademicResumeAction, deleteResumeAction, duplicateResumeAction } from "@/app/resume-builder/actions";
import { DashboardShell } from "../_components/dashboard-shell";
import { ChecklistCard, EmptyState, ExportGroup, SectionHeader, StatusCard } from "../_components/dashboard-ui";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { EXPORT_CREDIT_COST, getUserAccount, RESUME_CREDIT_COST } from "@/lib/resume-builder/admin";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getOptionSets } from "@/lib/resume-builder/options";
import { listResumes } from "@/lib/resume-builder/resumes";

type StudyDashboardProps = {
  searchParams: Promise<{ deleted?: string; error?: string; "credit-requested"?: string }>;
};

export default async function StudyDashboardPage({ searchParams }: StudyDashboardProps) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const m = getMessages(await getLocale());
  const s = m.workspaceStudy;
  const c = m.common;

  const { deleted, error, "credit-requested": creditRequested } = await searchParams;
  const all = listResumes(user.id);
  const resumes = all.filter((r) => r.kind === "academic");
  const options = getOptionSets();
  const account = getUserAccount(user.id);
  const canExport = account.credits >= EXPORT_CREDIT_COST;
  const canCreateResume = account.credits >= RESUME_CREDIT_COST;

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <DashboardShell>
        <header className="glass rounded-[2.5rem] border border-violet-400/20 p-6 md:p-8">
          <h1 className="text-3xl font-black md:text-4xl">{s.headerTitle}</h1>
          <p className="mt-2 max-w-3xl text-slate-300">{s.headerSubtitle}</p>
        </header>

        <section className="my-6 grid gap-5 lg:grid-cols-3">
          <StatusCard icon={<GraduationCap />} label={s.statDrafts} value={resumes.length.toString()} detail={s.statDraftsDetail} />
          <StatusCard icon={<FileText />} label={s.statExports} value={t(m, "workspaceStudy.statExportsValue", { cost: EXPORT_CREDIT_COST })} detail={s.statExportsDetail} />
          <StatusCard icon={<FileText />} label={s.statCredits} value={String(account.credits)} detail={s.statCreditsDetail} />
        </section>

        <section className="glass rounded-[2.5rem] p-6 md:p-8">
          <SectionHeader
            icon={<GraduationCap size={22} />}
            eyebrow={s.sectionEyebrow}
            title={s.sectionTitle}
            text={s.sectionText}
            action={
              <Link href="#new-academic" className="rounded-full bg-violet-300 px-4 py-2 text-sm font-black text-slate-950">
                {s.newCv}
              </Link>
            }
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
            <form id="new-academic" action={createAcademicResumeAction} className="rounded-[2rem] border border-violet-400/25 bg-slate-950/45 p-5">
              <h3 className="text-xl font-black">{s.formTitle}</h3>
              <p className="mt-2 text-sm text-slate-300">{t(m, "workspaceStudy.formCreditHint", { cost: RESUME_CREDIT_COST })}</p>
              <label className="mt-5 block">
                <span className="text-sm font-semibold">{s.fieldTitle}</span>
                <input name="title" defaultValue="Academic CV" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-violet-300" />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">{s.fieldRegion}</span>
                <select name="country" defaultValue="Remote" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-violet-300">
                  {options.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              {canCreateResume ? (
                <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-300 px-5 py-3 font-black text-slate-950" type="submit">
                  <Plus size={18} /> {s.createEdit}
                </button>
              ) : (
                <p className="mt-5 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{s.noCreditsCreate}</p>
              )}
            </form>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-black">{s.savedTitle}</h3>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">{t(m, "common.totalCount", { count: resumes.length })}</span>
              </div>
              {!canExport && <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{s.lowCreditsDownload}</p>}
              {creditRequested && <p className="mb-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{c.creditRequestSent}</p>}
              {deleted && <p className="mb-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{s.deleted}</p>}
              {error === "no-credits-resume" && <p className="mb-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{s.noCreditsAnother}</p>}
              {error && error !== "no-credits-resume" && <p className="mb-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{c.somethingWrong}</p>}
              <div className="space-y-3">
                {resumes.length === 0 && <EmptyState title={s.emptyTitle} text={s.emptyText} />}
                {resumes.map((resume) => (
                  <article key={resume.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold">{resume.title}</h4>
                        <p className="mt-1 text-sm text-slate-400">{t(m, "workspaceStudy.rowMeta", { country: resume.country, updated: c.updated, date: resume.updatedAt })}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link className="rounded-full bg-violet-300 px-4 py-2 text-sm font-black text-slate-950" href={`/resume/academic-editor/${resume.id}`}>
                          {c.edit}
                        </Link>
                        <form action={duplicateResumeAction}>
                          <input type="hidden" name="resumeId" value={resume.id} />
                          <button
                            disabled={!canCreateResume}
                            className="inline-flex items-center gap-2 rounded-full bg-violet-300/15 px-4 py-2 text-sm font-bold text-violet-100 hover:bg-violet-300/25 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="mt-4">
                      <ExportGroup resumeId={resume.id} label={s.exportLabel} type="academic-cv" icon={<FileText size={15} />} canExport={canExport} exportLockedHint={c.noExportCredits} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <ChecklistCard title={s.checklistTitle} items={s.checklistItems} />
        </section>
      </DashboardShell>
    </main>
  );
}
