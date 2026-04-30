import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";

export function SectionHeader({ icon, eyebrow, title, text, action }: { icon: React.ReactNode; eyebrow: string; title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <div className="mb-4 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black">{title}</h2>
        <p className="mt-3 leading-7 text-slate-300">{text}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-cyan-200">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <h2 className="mt-1 text-2xl font-black">{value}</h2>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

export function ExportGroup({
  resumeId,
  label,
  type,
  icon,
  canExport,
  exportLockedHint = "No export credits"
}: {
  resumeId: number;
  label: string;
  type: "cv" | "cover-letter" | "email" | "academic-cv";
  icon: React.ReactNode;
  canExport: boolean;
  exportLockedHint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
        {icon} {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {(["md", "docx", "pdf"] as const).map((format) =>
          canExport ? (
            <a
              key={format}
              className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/15"
              href={`/api/resume-builder/export/${resumeId}?type=${type}&format=${format}`}
            >
              {format.toUpperCase()}
            </a>
          ) : (
            <span key={format} className="cursor-not-allowed rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-500" title={exportLockedHint}>
              {format.toUpperCase()}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export function LearningAction({ icon, title, text, href }: { icon: React.ReactNode; title: string; text: string; href: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 transition hover:bg-white/8">
      <div className="mb-3 inline-flex rounded-2xl bg-violet-300/10 p-3 text-violet-200">{icon}</div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </Link>
  );
}

export function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="glass rounded-[2rem] p-6">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-sm text-slate-200">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-5">
      <p className="font-bold text-slate-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

export function BriefcaseIcon() {
  return (
    <span className="relative inline-flex">
      <FileText size={22} />
    </span>
  );
}
