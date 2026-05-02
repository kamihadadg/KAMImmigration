import type { Messages } from "@/lib/i18n/messages";

export type ResumeAssistSection = "summary" | "target" | "experience" | "academic_research" | "academic_experience" | "academic_lines";

export type ResumeAssistTask = "polish" | "shorten" | "impact_bullets" | "clarify";

export type ResumeAiAssistPack = {
  labels: Messages["aiAssist"];
  emptyField: string;
  creditCost: number;
  tasks: Array<{ key: ResumeAssistTask; label: string }>;
};

export function buildResumeAiPack(m: Messages, creditCost: number): ResumeAiAssistPack {
  const t = m.resumeAi.tasks;
  return {
    labels: { ...m.aiAssist, fabTitle: m.resumeAi.fabTitle, fabAria: m.resumeAi.fabAria },
    emptyField: m.resumeAi.emptyField,
    creditCost,
    tasks: [
      { key: "polish", label: t.polish },
      { key: "shorten", label: t.shorten },
      { key: "impact_bullets", label: t.impactBullets },
      { key: "clarify", label: t.clarify }
    ]
  };
}
