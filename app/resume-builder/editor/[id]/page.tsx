import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, FileText, GraduationCap, Layers, Save, Sparkles, UserRound } from "lucide-react";
import { saveResumeAction } from "../../actions";
import { ResumeFormSharedProvider } from "@/components/resume-builder/resume-form-shared-context";
import { EducationEditor, ProjectsEditor, SkillsEditor } from "@/components/resume-builder/dynamic-section-editors";
import { ExperienceEditor } from "@/components/resume-builder/experience-editor";
import { AI_ASSIST_CREDIT_COST, EXPORT_CREDIT_COST, getUserAccount } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getOptionSets } from "@/lib/resume-builder/options";
import { buildResumeAiPack } from "@/lib/resume-builder/resume-ai";
import { getResume } from "@/lib/resume-builder/resumes";
import { ResumeTextAreaWithAi } from "@/components/resume-builder/resume-textarea-with-ai";

type EditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const m = getMessages(locale);
  const ej = m.editorJob;
  const sh = m.editorShared;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  const { id } = await params;
  const { saved, error } = await searchParams;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) notFound();

  const resume = getResume(user.id, resumeId);
  if (!resume) notFound();
  if (resume.kind === "academic") {
    redirect(`/resume-builder/academic-editor/${resumeId}`);
  }
  const profile = resume.profile;
  const options = getOptionSets();
  const account = getUserAccount(user.id);
  const canExport = account.credits >= EXPORT_CREDIT_COST;

  const f = ej.fields;
  const sec = ej.sections;
  const resumeAi = buildResumeAiPack(m, AI_ASSIST_CREDIT_COST);

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/work" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            <BackIcon size={16} /> {ej.backDashboard}
          </Link>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              {t(m, "editorJob.creditsLine", { credits: account.credits, cost: EXPORT_CREDIT_COST })}
            </span>
            {canExport ? (
              <div className="flex flex-wrap gap-2">
                <ExportLink resumeId={resume.id} type="cv" label={ej.exportCv} />
                <ExportLink resumeId={resume.id} type="cover-letter" label={ej.exportCover} />
                <ExportLink resumeId={resume.id} type="email" label={ej.exportEmail} />
              </div>
            ) : (
              <span className="rounded-full bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100">{ej.noExportCredits}</span>
            )}
          </div>
        </div>

        <ResumeFormSharedProvider value={sh}>
          <form action={saveResumeAction} className="glass rounded-[2.5rem] p-6 md:p-8">
            <input type="hidden" name="resumeId" value={resume.id} />
            <header className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{ej.eyebrow}</p>
              <h1 className="mt-2 text-4xl font-black">{ej.title}</h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-300">{ej.intro}</p>
              {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{ej.saved}</p>}
              {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{ej.errorFields}</p>}
              {!canExport && <p className="mt-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{ej.lowCreditsBanner}</p>}
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label={ej.fieldResumeTitle} name="title" defaultValue={resume.title} selectPlaceholder={sh.selectPlaceholder} />
              <Field label={ej.fieldCountryMarket} name="country" defaultValue={resume.country} options={options.countries} selectPlaceholder={sh.selectPlaceholder} />
            </div>

            <EditorSection icon={<UserRound />} title={sec.personal.title} description={sec.personal.desc}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={f.fullName} name="personal.fullName" defaultValue={profile.personal.fullName} required selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.headline} name="personal.headline" defaultValue={profile.personal.headline} required selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.location} name="personal.location" defaultValue={profile.personal.location} options={options.locations} required selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.address} name="personal.address" defaultValue={profile.personal.address} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.nationality} name="personal.nationality" defaultValue={profile.personal.nationality} options={options.nationalities} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.email} name="personal.email" type="email" defaultValue={profile.personal.email} required selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.phone} name="personal.phone" defaultValue={profile.personal.phone} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.linkedin} name="personal.linkedin" defaultValue={profile.personal.linkedin} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.github} name="personal.github" defaultValue={profile.personal.github} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={f.website} name="personal.website" defaultValue={profile.personal.website} selectPlaceholder={sh.selectPlaceholder} />
              </div>
            </EditorSection>

            <EditorSection icon={<Sparkles />} title={sec.target.title} description={sec.target.desc}>
              <Field label={f.relocationLine} name="target.relocationLine" defaultValue={profile.target.relocationLine} required selectPlaceholder={sh.selectPlaceholder} />
              <ResumeTextAreaWithAi
                section="target"
                resumeAi={resumeAi}
                label={f.permitParagraph}
                name="target.permitLine"
                defaultValue={profile.target.permitLine}
                rows={4}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={f.availability} name="target.availability" defaultValue={profile.target.availability} options={options.availability} selectPlaceholder={sh.selectPlaceholder} />
                <Field
                  label={f.preferredLocations}
                  name="target.preferredLocations"
                  defaultValue={(profile.target.preferredLocations ?? []).join(", ")}
                  placeholder={options.locations.slice(0, 4).join(", ")}
                  selectPlaceholder={sh.selectPlaceholder}
                />
              </div>
              <Field
                label={f.targetRoles}
                name="target.targetRoles"
                defaultValue={profile.target.targetRoles.join(", ")}
                placeholder={options.targetRoles.slice(0, 4).join(", ")}
                selectPlaceholder={sh.selectPlaceholder}
              />
            </EditorSection>

            <EditorSection icon={<FileText />} title={sec.summary.title} description={sec.summary.desc}>
              <ResumeTextAreaWithAi
                section="summary"
                resumeAi={resumeAi}
                label={f.summaryParagraphs}
                name="summary"
                defaultValue={profile.summary.join("\n")}
                rows={6}
              />
            </EditorSection>

            <EditorSection icon={<Layers />} title={sec.skills.title} description={sec.skills.desc}>
              <SkillsEditor initialSkills={profile.skills} options={options} />
            </EditorSection>

            <EditorSection icon={<BriefcaseBusiness />} title={sec.experience.title} description={sec.experience.desc}>
              <ExperienceEditor initialItems={profile.experience} options={options} resumeAi={resumeAi} />
            </EditorSection>

            <EditorSection icon={<Sparkles />} title={sec.projects.title} description={sec.projects.desc}>
              <ProjectsEditor initialItems={profile.projects} options={options} />
            </EditorSection>

            <EditorSection icon={<GraduationCap />} title={sec.education.title} description={sec.education.desc}>
              <div className="grid gap-5 lg:grid-cols-2">
                <EducationEditor initialItems={profile.education} options={options} />
                <TextArea label={f.languagesLines} name="languages" defaultValue={profile.languages.join("\n")} rows={8} placeholder={options.languages.join("\n")} />
              </div>
            </EditorSection>

            <EditorSection icon={<Sparkles />} title={sec.credentials.title} description={sec.credentials.desc}>
              <div className="grid gap-4 md:grid-cols-2">
                <TextArea label={f.certifications} name="certifications" defaultValue={(profile.certifications ?? []).join("\n")} rows={5} />
                <TextArea label={f.awards} name="awards" defaultValue={(profile.awards ?? []).join("\n")} rows={5} />
                <TextArea label={f.publications} name="publications" defaultValue={(profile.publications ?? []).join("\n")} rows={5} />
                <TextArea label={f.patents} name="patents" defaultValue={(profile.patents ?? []).join("\n")} rows={5} />
                <TextArea label={f.volunteer} name="volunteer" defaultValue={(profile.volunteer ?? []).join("\n")} rows={5} />
              </div>
            </EditorSection>

            <EditorSection icon={<FileText />} title={sec.cover.title} description={sec.cover.desc}>
              <Field label={f.greeting} name="coverLetter.greeting" defaultValue={profile.coverLetter.greeting} selectPlaceholder={sh.selectPlaceholder} />
              <TextArea label={f.opening} name="coverLetter.opening" defaultValue={profile.coverLetter.opening} rows={4} />
              <TextArea label={f.closing} name="coverLetter.closing" defaultValue={profile.coverLetter.closing} rows={4} />
            </EditorSection>

            <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950" type="submit">
              <Save size={18} /> {ej.saveResume}
            </button>
          </form>
        </ResumeFormSharedProvider>
      </section>
    </main>
  );
}

function EditorSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-slate-950/45 p-5">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ExportLink({ resumeId, type, label }: { resumeId: number; type: "cv" | "cover-letter" | "email"; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
      <span className="text-slate-200">{label}</span>
      {(["md", "docx", "pdf"] as const).map((format) => (
        <a key={format} className="rounded-full bg-white/10 px-2 py-1 text-slate-100 hover:bg-white/20" href={`/api/resume-builder/export/${resumeId}?type=${type}&format=${format}`}>
          {format.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  options,
  placeholder,
  selectPlaceholder = ""
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  selectPlaceholder?: string;
}) {
  const selectOptions = options ? (Array.from(new Set([defaultValue, ...options].map((item) => item?.trim()).filter(Boolean))) as string[]) : [];

  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {options ? (
        <select
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
        >
          <option value="">{selectPlaceholder}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
        />
      )}
    </label>
  );
}

function TextArea({ label, name, defaultValue, rows = 5, required = false, placeholder }: { label: string; name: string; defaultValue?: string; rows?: number; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
