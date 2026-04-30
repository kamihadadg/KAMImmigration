import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Microscope,
  Mic2,
  Save,
  Sparkles,
  UserRound
} from "lucide-react";
import { saveAcademicResumeAction } from "../../actions";
import { AcademicEditorCopyProvider } from "@/components/resume-builder/academic-editor-copy-context";
import { ResumeFormSharedProvider } from "@/components/resume-builder/resume-form-shared-context";
import {
  PresentationsEditor,
  PublicationsEditor,
  ReferencesEditor,
  ResearchExperienceEditor,
  StandardizedTestsEditor,
  TeachingEditor
} from "@/components/resume-builder/academic-section-editors";
import { EducationEditor, ProjectsEditor, SkillsEditor } from "@/components/resume-builder/dynamic-section-editors";
import { EXPORT_CREDIT_COST, getUserAccount } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/t";
import { getOptionSets } from "@/lib/resume-builder/options";
import { getResume } from "@/lib/resume-builder/resumes";

type AcademicEditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AcademicEditorPage({ params, searchParams }: AcademicEditorPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const m = getMessages(locale);
  const ea = m.editorAcademic;
  const sh = m.editorShared;
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  const { id } = await params;
  const { saved, error } = await searchParams;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) notFound();

  const resume = getResume(user.id, resumeId);
  if (!resume) notFound();
  if (resume.kind !== "academic") {
    redirect(`/resume-builder/editor/${resumeId}`);
  }

  const profile = resume.profile;
  const options = getOptionSets();
  const account = getUserAccount(user.id);
  const canExport = account.credits >= EXPORT_CREDIT_COST;

  const f = ea.fields;
  const sec = ea.sections;

  return (
    <main className="soft-grid min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/study" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            <BackIcon size={16} /> {ea.backDashboard}
          </Link>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-300/10 px-4 py-2 text-sm font-bold text-violet-100">
              {t(m, "editorAcademic.creditsLine", { credits: account.credits, cost: EXPORT_CREDIT_COST })}
            </span>
            {canExport ? (
              <div className="flex flex-wrap gap-2">
                <ExportLink resumeId={resume.id} type="academic-cv" label={ea.exportLabel} />
              </div>
            ) : (
              <span className="rounded-full bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100">{ea.noExportCredits}</span>
            )}
          </div>
        </div>

        <ResumeFormSharedProvider value={sh}>
          <AcademicEditorCopyProvider value={ea}>
            <form action={saveAcademicResumeAction} className="glass rounded-[2.5rem] p-6 md:p-8">
              <input type="hidden" name="resumeId" value={resume.id} />
              <header className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200">{ea.eyebrow}</p>
                <h1 className="mt-2 text-4xl font-black">{ea.title}</h1>
                <p className="mt-3 max-w-3xl leading-7 text-slate-300">{ea.intro}</p>
                {saved && <p className="mt-4 rounded-2xl bg-emerald-400/10 p-3 text-sm text-emerald-100">{ea.saved}</p>}
                {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{ea.errorRequired}</p>}
                {!canExport && <p className="mt-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-100">{ea.lowCreditsBanner}</p>}
              </header>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label={ea.fieldDocTitle} name="title" defaultValue={resume.title} selectPlaceholder={sh.selectPlaceholder} />
                <Field label={ea.fieldRegionTag} name="country" defaultValue={resume.country} selectPlaceholder={sh.selectPlaceholder} />
              </div>

              <EditorSection icon={<UserRound />} title={sec.contact.title} description={sec.contact.desc}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={f.fullName} name="personal.fullName" defaultValue={profile.personal.fullName} required selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.email} name="personal.email" type="email" defaultValue={profile.personal.email} required selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.location} name="personal.location" defaultValue={profile.personal.location} options={options.locations} required selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.phone} name="personal.phone" defaultValue={profile.personal.phone} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.address} name="personal.address" defaultValue={profile.personal.address} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.nationality} name="personal.nationality" defaultValue={profile.personal.nationality} options={options.nationalities} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.linkedin} name="personal.linkedin" defaultValue={profile.personal.linkedin} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.websiteScholar} name="personal.website" defaultValue={profile.personal.website} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.orcid} name="personal.orcid" defaultValue={profile.personal.orcid} placeholder={f.orcidPlaceholder} selectPlaceholder={sh.selectPlaceholder} />
                </div>
              </EditorSection>

              <EditorSection icon={<BookOpen />} title={sec.application.title} description={sec.application.desc}>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label={f.program} name="application.program" defaultValue={profile.application.program} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.institution} name="application.institution" defaultValue={profile.application.institution} selectPlaceholder={sh.selectPlaceholder} />
                  <Field label={f.intakeTerm} name="application.intakeTerm" defaultValue={profile.application.intakeTerm} selectPlaceholder={sh.selectPlaceholder} />
                </div>
              </EditorSection>

              <EditorSection icon={<Sparkles />} title={sec.researchInterests.title} description={sec.researchInterests.desc}>
                <TextArea label={f.interestsLines} name="researchInterests" defaultValue={profile.researchInterests.join("\n")} rows={6} />
              </EditorSection>

              <EditorSection icon={<GraduationCap />} title={sec.education.title} description={sec.education.desc}>
                <EducationEditor initialItems={profile.education} options={options} />
              </EditorSection>

              <EditorSection icon={<BookOpen />} title={sec.teaching.title} description={sec.teaching.desc}>
                <TeachingEditor initialItems={profile.teaching} />
              </EditorSection>

              <EditorSection icon={<Microscope />} title={sec.researchExp.title} description={sec.researchExp.desc}>
                <ResearchExperienceEditor initialItems={profile.researchExperience} />
              </EditorSection>

              <EditorSection icon={<FileText />} title={sec.publications.title} description={sec.publications.desc}>
                <PublicationsEditor initialItems={profile.publications} />
              </EditorSection>

              <EditorSection icon={<Mic2 />} title={sec.presentations.title} description={sec.presentations.desc}>
                <PresentationsEditor initialItems={profile.presentations} />
              </EditorSection>

              <EditorSection icon={<Sparkles />} title={sec.projects.title} description={sec.projects.desc}>
                <ProjectsEditor initialItems={profile.projects} options={options} />
              </EditorSection>

              <EditorSection icon={<Sparkles />} title={sec.skills.title} description={sec.skills.desc}>
                <SkillsEditor initialSkills={profile.skills} options={options} />
              </EditorSection>

              <EditorSection icon={<GraduationCap />} title={sec.honors.title} description={sec.honors.desc}>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextArea label={f.honorsScholarships} name="honors" defaultValue={profile.honors.join("\n")} rows={5} />
                  <TextArea label={f.grantsFunding} name="grants" defaultValue={profile.grants.join("\n")} rows={5} />
                  <TextArea label={f.serviceLines} name="service" defaultValue={profile.service.join("\n")} rows={5} />
                  <TextArea label={f.languagesLines} name="languages" defaultValue={profile.languages.join("\n")} rows={5} placeholder={options.languages.join("\n")} />
                </div>
              </EditorSection>

              <EditorSection icon={<FileText />} title={sec.tests.title} description={sec.tests.desc}>
                <StandardizedTestsEditor initialItems={profile.standardizedTests} />
              </EditorSection>

              <EditorSection icon={<UserRound />} title={sec.references.title} description={sec.references.desc}>
                <ReferencesEditor initialItems={profile.references} />
              </EditorSection>

              <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-300 px-6 py-3 font-black text-slate-950" type="submit">
                <Save size={18} /> {ea.saveCv}
              </button>
            </form>
          </AcademicEditorCopyProvider>
        </ResumeFormSharedProvider>
      </section>
    </main>
  );
}

function EditorSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-slate-950/45 p-5">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-violet-300/10 p-3 text-violet-200">{icon}</div>
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ExportLink({ resumeId, type, label }: { resumeId: number; type: "academic-cv"; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
      <span className="text-slate-200">{label}</span>
      {(["md", "docx", "pdf"] as const).map((format) => (
        <a
          key={format}
          className="rounded-full bg-white/10 px-2 py-1 text-slate-100 hover:bg-white/20"
          href={`/api/resume-builder/export/${resumeId}?type=${type}&format=${format}`}
        >
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
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-violet-300"
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
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-violet-300"
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-violet-300"
      />
    </label>
  );
}
