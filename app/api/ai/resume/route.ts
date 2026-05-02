import { NextResponse } from "next/server";
import { z } from "zod";
import { ChatCompletionError, createChatCompletion } from "@/lib/ai/chat-completion";
import { AI_ASSIST_CREDIT_COST, debitUserCredits, getUserAccount, refundUserCredits } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getEffectiveLlmConfig } from "@/lib/resume-builder/user-ai-settings";
import type { ResumeAssistSection, ResumeAssistTask } from "@/lib/resume-builder/resume-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  section: z.enum(["summary", "target", "experience", "academic_research", "academic_experience", "academic_lines"]),
  task: z.enum(["polish", "shorten", "impact_bullets", "clarify"]),
  context: z.string().min(1).max(20000)
});

function sectionLine(section: ResumeAssistSection): string {
  switch (section) {
    case "summary":
      return "Focus: professional summary / profile paragraphs for a job CV.";
    case "target":
      return "Focus: work authorization, relocation, availability, or targeting language for employers.";
    case "experience":
      return "Focus: work experience bullets — outcomes, metrics, tools, scope.";
    case "academic_research":
      return "Focus: research interests statement for graduate admissions.";
    case "academic_experience":
      return "Focus: research or lab experience description and bullets.";
    case "academic_lines":
      return "Focus: CV lines (honors, service, teaching notes, etc.).";
    default:
      return "Focus: resume content.";
  }
}

function taskDirective(task: ResumeAssistTask): string {
  switch (task) {
    case "polish":
      return "Tighten wording, fix awkward phrasing, and keep facts faithful to the draft. Suggest improved sentences or bullets the user can paste back.";
    case "shorten":
      return "Reduce length while keeping the strongest facts. Prefer fewer, sharper lines.";
    case "impact_bullets":
      return "Turn rough notes into strong achievement bullets where possible (action + scope + outcome; add plausible metrics only if the user already hinted at numbers). If the block is prose, still structure suggestions as bullets.";
    case "clarify":
      return "Explain simply what is missing or unclear for a recruiter/committee, and give 3–6 concrete additions or rewrites — no invented employers, degrees, or dates.";
    default:
      return "Give practical, concise suggestions.";
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cfg = getEffectiveLlmConfig(user.id);
  if (!cfg.apiKey) {
    return NextResponse.json({ error: "no_ai_config" }, { status: 503 });
  }

  const charged = debitUserCredits(user.id, AI_ASSIST_CREDIT_COST);
  if (!charged) {
    return NextResponse.json({ error: "no_credits", cost: AI_ASSIST_CREDIT_COST }, { status: 402 });
  }

  const ctx = parsed.context.length > 14000 ? `${parsed.context.slice(0, 14000)}\n…` : parsed.context;
  const system = [
    "You are a concise resume and admissions-CV coach.",
    sectionLine(parsed.section),
    "Ground suggestions ONLY in the user draft below; do not invent employers, institutions, credentials, or dates.",
    "Write the entire answer in English only — no Persian/Farsi in your reply (the draft may contain other languages).",
    "Use plain text: short paragraphs and lines starting with '- ' for bullets. Do NOT use markdown tables, fenced code blocks, ## headings, **bold**, __underscore__, or hash symbols.",
    taskDirective(parsed.task)
  ].join("\n");

  const userMsg = `### Draft / notes\n${ctx}`;

  try {
    const reply = await createChatCompletion({
      apiKey: cfg.apiKey,
      model: cfg.model,
      providerPreference: cfg.aiProvider,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg }
      ]
    });
    const account = getUserAccount(user.id);
    return NextResponse.json({
      reply,
      credits: account.credits,
      cost: AI_ASSIST_CREDIT_COST,
      usedUserKey: cfg.usingUserKey
    });
  } catch (e) {
    refundUserCredits(user.id, AI_ASSIST_CREDIT_COST);
    if (e instanceof ChatCompletionError) {
      const codeByCategory = {
        auth: "INVALID_KEY",
        rate_limit: "RATE_LIMIT",
        bad_request: "BAD_REQUEST",
        server: "UPSTREAM",
        network: "NETWORK",
        timeout: "TIMEOUT",
        parse: "PARSE"
      } as const;
      const code = codeByCategory[e.category];
      const safeHint =
        e.category === "bad_request" || e.category === "auth" ? e.message.slice(0, 240) : undefined;
      console.error("[api/ai/resume] LLM error", { code, category: e.category, message: e.message });
      return NextResponse.json({ error: "llm_failed", code, hint: safeHint }, { status: 502 });
    }
    console.error("[api/ai/resume] unexpected", e);
    return NextResponse.json({ error: "llm_failed", code: "UNKNOWN" }, { status: 502 });
  }
}
