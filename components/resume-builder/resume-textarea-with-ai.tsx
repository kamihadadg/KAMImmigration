"use client";

import { useCallback, useId } from "react";
import { ResumeAiAssistBubble } from "@/components/resume-ai-assist-bubble";
import type { ResumeAiAssistPack, ResumeAssistSection } from "@/lib/resume-builder/resume-ai";

type Props = {
  section: ResumeAssistSection;
  resumeAi: ResumeAiAssistPack;
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
};

export function ResumeTextAreaWithAi({ section, resumeAi, label, name, defaultValue, rows = 5, required = false, placeholder }: Props) {
  const id = useId();
  const fieldId = `resume-ai-ta-${id.replace(/:/g, "")}`;
  const getContext = useCallback(() => {
    if (typeof document === "undefined") return "";
    const el = document.getElementById(fieldId) as HTMLTextAreaElement | null;
    return el?.value ?? "";
  }, [fieldId]);

  return (
    <ResumeAiAssistBubble
      section={section}
      getContext={getContext}
      labels={resumeAi.labels}
      emptyField={resumeAi.emptyField}
      creditCost={resumeAi.creditCost}
      tasks={resumeAi.tasks}
    >
      <label className="block">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        <textarea
          id={fieldId}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-cyan-300"
        />
      </label>
    </ResumeAiAssistBubble>
  );
}
