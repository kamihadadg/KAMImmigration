"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { interpolate } from "@/lib/i18n/t";
import { useAcademicEditorCopy } from "@/components/resume-builder/academic-editor-copy-context";
import { useResumeFormShared } from "@/components/resume-builder/resume-form-shared-context";

type TeachingItem = {
  institution: string;
  course: string;
  role: string;
  period: string;
  bullets: string[];
};

const emptyTeaching: TeachingItem = { institution: "", course: "", role: "", period: "", bullets: [] };

export function TeachingEditor({ initialItems }: { initialItems: TeachingItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const te = ac.teachingEditor;
  const [items, setItems] = useState<TeachingItem[]>(initialItems.length ? initialItems : [{ ...emptyTeaching }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="teachingCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(te.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={te.institution} name={`teaching.${index}.institution`} defaultValue={item.institution} />
            <Field label={te.course} name={`teaching.${index}.course`} defaultValue={item.course} />
            <Field label={te.role} name={`teaching.${index}.role`} defaultValue={item.role} />
            <Field label={te.period} name={`teaching.${index}.period`} defaultValue={item.period} />
          </div>
          <div className="mt-4">
            <TextArea label={te.bullets} name={`teaching.${index}.bullets`} defaultValue={(item.bullets ?? []).join("\n")} rows={5} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyTeaching }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {te.add}
      </button>
    </div>
  );
}

type ResearchItem = {
  labOrGroup: string;
  institution: string;
  title: string;
  period: string;
  bullets: string[];
};

const emptyResearch: ResearchItem = { labOrGroup: "", institution: "", title: "", period: "", bullets: [] };

export function ResearchExperienceEditor({ initialItems }: { initialItems: ResearchItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const re = ac.researchEditor;
  const [items, setItems] = useState<ResearchItem[]>(initialItems.length ? initialItems : [{ ...emptyResearch }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="researchExperienceCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(re.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={re.labOptional} name={`researchExperience.${index}.labOrGroup`} defaultValue={item.labOrGroup} />
            <Field label={re.institution} name={`researchExperience.${index}.institution`} defaultValue={item.institution} />
            <Field label={re.titleRole} name={`researchExperience.${index}.title`} defaultValue={item.title} />
            <Field label={re.period} name={`researchExperience.${index}.period`} defaultValue={item.period} />
          </div>
          <div className="mt-4">
            <TextArea label={re.bullets} name={`researchExperience.${index}.bullets`} defaultValue={(item.bullets ?? []).join("\n")} rows={5} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyResearch }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {re.add}
      </button>
    </div>
  );
}

type PubItem = { citation: string; doi: string; venue: string; year: string };
const emptyPub: PubItem = { citation: "", doi: "", venue: "", year: "" };

export function PublicationsEditor({ initialItems }: { initialItems: PubItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const pe = ac.publicationsEditor;
  const [items, setItems] = useState<PubItem[]>(initialItems.length ? initialItems : [{ ...emptyPub }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="publicationsCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(pe.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <TextArea label={pe.fullCitation} name={`publications.${index}.citation`} defaultValue={item.citation} rows={3} />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label={pe.doiOptional} name={`publications.${index}.doi`} defaultValue={item.doi} />
            <Field label={pe.venue} name={`publications.${index}.venue`} defaultValue={item.venue} />
            <Field label={pe.year} name={`publications.${index}.year`} defaultValue={item.year} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyPub }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {pe.add}
      </button>
    </div>
  );
}

type PresItem = { title: string; venue: string; date: string; kind: string };
const emptyPres: PresItem = { title: "", venue: "", date: "", kind: "" };

export function PresentationsEditor({ initialItems }: { initialItems: PresItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const pr = ac.presentationsEditor;
  const [items, setItems] = useState<PresItem[]>(initialItems.length ? initialItems : [{ ...emptyPres }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="presentationsCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(pr.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={pr.title} name={`presentations.${index}.title`} defaultValue={item.title} />
            <Field label={pr.kind} name={`presentations.${index}.kind`} defaultValue={item.kind} />
            <Field label={pr.venue} name={`presentations.${index}.venue`} defaultValue={item.venue} />
            <Field label={pr.date} name={`presentations.${index}.date`} defaultValue={item.date} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyPres }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {pr.add}
      </button>
    </div>
  );
}

type TestItem = { name: string; score: string; date: string };
const emptyTest: TestItem = { name: "", score: "", date: "" };

export function StandardizedTestsEditor({ initialItems }: { initialItems: TestItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const te = ac.testsEditor;
  const [items, setItems] = useState<TestItem[]>(initialItems.length ? initialItems : [{ ...emptyTest }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="standardizedTestsCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(te.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={te.examName} name={`standardizedTests.${index}.name`} defaultValue={item.name} />
            <Field label={te.score} name={`standardizedTests.${index}.score`} defaultValue={item.score} />
            <Field label={te.date} name={`standardizedTests.${index}.date`} defaultValue={item.date} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyTest }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {te.add}
      </button>
    </div>
  );
}

type RefItem = { name: string; title: string; affiliation: string; email: string; phone: string };
const emptyRef: RefItem = { name: "", title: "", affiliation: "", email: "", phone: "" };

export function ReferencesEditor({ initialItems }: { initialItems: RefItem[] }) {
  const sh = useResumeFormShared();
  const ac = useAcademicEditorCopy();
  const re = ac.referencesEditor;
  const [items, setItems] = useState<RefItem[]>(initialItems.length ? initialItems : [{ ...emptyRef }]);

  return (
    <div className="grid gap-5">
      <input type="hidden" name="referencesCount" value={items.length} />
      {items.map((item, index) => (
        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-cyan-100">{interpolate(re.cardTitle, { n: index + 1 })}</p>
            <button
              type="button"
              onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
              className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-100 hover:bg-red-500/25"
            >
              <Trash2 size={14} /> {sh.remove}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={re.name} name={`references.${index}.name`} defaultValue={item.name} />
            <Field label={re.title} name={`references.${index}.title`} defaultValue={item.title} />
            <Field label={re.affiliation} name={`references.${index}.affiliation`} defaultValue={item.affiliation} />
            <Field label={re.email} name={`references.${index}.email`} defaultValue={item.email} />
            <Field label={re.phone} name={`references.${index}.phone`} defaultValue={item.phone} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((c) => [...c, { ...emptyRef }])}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:bg-cyan-300/20"
      >
        <Plus size={18} /> {re.add}
      </button>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue, rows = 4 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
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
