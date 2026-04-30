"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { interpolate } from "@/lib/i18n/t";
import type { OptionSets } from "@/lib/resume-builder/options";
import type { ResumeProfile } from "@/lib/resume-builder/schema";
import { useResumeFormShared } from "@/components/resume-builder/resume-form-shared-context";

type ExperienceItem = ResumeProfile["experience"][number];

type ExperienceEditorProps = {
  initialItems: ExperienceItem[];
  options: OptionSets;
};

const emptyExperience: ExperienceItem = {
  company: "",
  location: "",
  title: "",
  employmentType: "",
  start: "",
  end: "",
  technologies: [],
  bullets: []
};

export function ExperienceEditor({ initialItems, options }: ExperienceEditorProps) {
  const sh = useResumeFormShared();
  const exp = sh.experience;
  const [items, setItems] = useState<ExperienceItem[]>(initialItems.length ? initialItems : [{ ...emptyExperience }]);

  function addExperience() {
    setItems((current) => [...current, { ...emptyExperience }]);
  }

  function removeExperience(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="grid gap-5">
      <input type="hidden" name="experienceCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(exp.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={exp.company} name={`experience.${index}.company`} defaultValue={item.company} />
            <Field label={exp.roleTitle} name={`experience.${index}.title`} defaultValue={item.title} />
            <Field label={exp.location} name={`experience.${index}.location`} defaultValue={item.location} />
            <SelectField label={exp.employmentType} name={`experience.${index}.employmentType`} defaultValue={item.employmentType} options={options.employmentTypes} placeholder={sh.selectPlaceholder} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={exp.start} name={`experience.${index}.start`} defaultValue={item.start} />
              <Field label={exp.end} name={`experience.${index}.end`} defaultValue={item.end} />
            </div>
            <Field
              label={exp.technologies}
              name={`experience.${index}.technologies`}
              defaultValue={(item.technologies ?? []).join(", ")}
              placeholder={options.technologies.slice(0, 4).join(", ")}
            />
          </div>
          <div className="mt-4">
            <TextArea label={exp.achievements} name={`experience.${index}.bullets`} defaultValue={(item.bullets ?? []).join("\n")} rows={6} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addExperience}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {exp.add}
      </button>
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
