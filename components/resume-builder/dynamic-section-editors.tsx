"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { interpolate } from "@/lib/i18n/t";
import { useResumeFormShared } from "@/components/resume-builder/resume-form-shared-context";
import type { OptionSets } from "@/lib/resume-builder/options";
import type { ResumeProfile } from "@/lib/resume-builder/schema";

type ProjectItem = ResumeProfile["projects"][number];
type EducationItem = ResumeProfile["education"][number];
type SkillItem = { name: string; values: string[] };

const emptyProject: ProjectItem = { name: "", url: "", role: "", technologies: [], description: "", bullets: [] };
const emptyEducation: EducationItem = { degree: "", field: "", school: "", location: "", start: "", end: "", gpa: "", honors: [], year: "" };
const emptySkill: SkillItem = { name: "", values: [] };

export function SkillsEditor({ initialSkills, options }: { initialSkills: ResumeProfile["skills"]; options: OptionSets }) {
  const sh = useResumeFormShared();
  const d = sh.dynamic;
  const initialItems = Object.entries(initialSkills).map(([name, values]) => ({ name, values }));
  const [items, setItems] = useState<SkillItem[]>(initialItems.length ? initialItems : [{ ...emptySkill }]);

  return (
    <DynamicShell addLabel={d.addSkillGroup} onAdd={() => setItems((current) => [...current, { ...emptySkill }])}>
      <input type="hidden" name="skillsCount" value={items.length} />
      {items.map((item, index) => (
        <Card key={index} title={interpolate(d.skillGroupTitle, { n: index + 1 })} onRemove={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} removeLabel={sh.remove}>
          <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
            <SelectField label={d.groupName} name={`skills.${index}.name`} defaultValue={item.name} options={options.skillGroups} placeholder={sh.selectPlaceholder} />
            <Field label={d.skillsComma} name={`skills.${index}.values`} defaultValue={item.values.join(", ")} placeholder={sh.skillsExamplePlaceholder} />
          </div>
        </Card>
      ))}
    </DynamicShell>
  );
}

export function ProjectsEditor({ initialItems, options }: { initialItems: ProjectItem[]; options: OptionSets }) {
  const sh = useResumeFormShared();
  const d = sh.dynamic;
  const [items, setItems] = useState<ProjectItem[]>(initialItems.length ? initialItems : [{ ...emptyProject }]);

  return (
    <DynamicShell addLabel={d.addProject} onAdd={() => setItems((current) => [...current, { ...emptyProject }])}>
      <input type="hidden" name="projectsCount" value={items.length} />
      {items.map((item, index) => (
        <Card key={index} title={interpolate(d.projectTitle, { n: index + 1 })} onRemove={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} removeLabel={sh.remove}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={d.projectName} name={`projects.${index}.name`} defaultValue={item.name} />
            <Field label={d.url} name={`projects.${index}.url`} defaultValue={item.url} />
            <SelectField label={d.yourRole} name={`projects.${index}.role`} defaultValue={item.role} options={options.projectRoles} placeholder={sh.selectPlaceholder} />
            <Field
              label={d.technologiesComma}
              name={`projects.${index}.technologies`}
              defaultValue={(item.technologies ?? []).join(", ")}
              placeholder={options.technologies.slice(0, 4).join(", ")}
            />
          </div>
          <div className="mt-4 grid gap-4">
            <TextArea label={d.description} name={`projects.${index}.description`} defaultValue={item.description} rows={3} />
            <TextArea label={d.highlightsLines} name={`projects.${index}.bullets`} defaultValue={(item.bullets ?? []).join("\n")} rows={5} />
          </div>
        </Card>
      ))}
    </DynamicShell>
  );
}

export function EducationEditor({ initialItems, options }: { initialItems: EducationItem[]; options: OptionSets }) {
  const sh = useResumeFormShared();
  const d = sh.dynamic;
  const [items, setItems] = useState<EducationItem[]>(initialItems.length ? initialItems : [{ ...emptyEducation }]);

  return (
    <DynamicShell addLabel={d.addEducation} onAdd={() => setItems((current) => [...current, { ...emptyEducation }])}>
      <input type="hidden" name="educationCount" value={items.length} />
      {items.map((item, index) => (
        <Card key={index} title={interpolate(d.educationTitle, { n: index + 1 })} onRemove={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} removeLabel={sh.remove}>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label={d.degree} name={`education.${index}.degree`} defaultValue={item.degree} options={options.degrees} placeholder={sh.selectPlaceholder} />
            <SelectField label={d.fieldOfStudy} name={`education.${index}.field`} defaultValue={item.field} options={options.fieldsOfStudy} placeholder={sh.selectPlaceholder} />
            <SelectField label={d.school} name={`education.${index}.school`} defaultValue={item.school} options={options.schools} placeholder={sh.selectPlaceholder} />
            <SelectField label={d.location} name={`education.${index}.location`} defaultValue={item.location} options={options.locations} placeholder={sh.selectPlaceholder} />
            <Field label={d.startDate} name={`education.${index}.start`} defaultValue={item.start || item.year} />
            <Field label={d.endDate} name={`education.${index}.end`} defaultValue={item.end || item.year} />
            <Field label={d.gpaAverage} name={`education.${index}.gpa`} defaultValue={item.gpa} />
            <Field label={d.gradYearOptional} name={`education.${index}.year`} defaultValue={item.year} />
          </div>
          <div className="mt-4">
            <TextArea label={d.honorsNotes} name={`education.${index}.honors`} defaultValue={(item.honors ?? []).join("\n")} rows={4} />
          </div>
        </Card>
      ))}
    </DynamicShell>
  );
}

function DynamicShell({ addLabel, onAdd, children }: { addLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      {children}
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {addLabel}
      </button>
    </div>
  );
}

function Card({ title, onRemove, removeLabel, children }: { title: string; onRemove: () => void; removeLabel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-cyan-100">{title}</p>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25">
          <Trash2 size={14} /> {removeLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
  placeholder: string;
}) {
  const values = Array.from(new Set([defaultValue, ...options].map((item) => item?.trim()).filter(Boolean))) as string[];

  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="">{placeholder}</option>
        {values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, name, defaultValue, rows = 5 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}
