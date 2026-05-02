import { NextResponse } from "next/server";
import { z } from "zod";
import { ChatCompletionError, createChatCompletion } from "@/lib/ai/chat-completion";
import { AI_ASSIST_CREDIT_COST, debitUserCredits, getUserAccount, refundUserCredits } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getEffectiveLlmConfig } from "@/lib/resume-builder/user-ai-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  day: z.number().int().min(1).max(400),
  section: z.enum(["vocabulary", "grammar", "listening", "reading", "writing", "speaking", "quiz"]),
  task: z.enum(["more_examples", "explain_simple", "listening_help", "reading_help", "writing_ideas", "speaking_hints", "quiz_explain", "vocab_deep"]),
  context: z.string().min(1).max(20000)
});

function taskDirective(task: z.infer<typeof bodySchema>["task"]): string {
  switch (task) {
    case "more_examples":
      return "Give several fresh example sentences that fit the same lesson point.";
    case "explain_simple":
      return "Explain the idea in simpler English (CEFR B1). Add 2–4 short bullet tips for common mistakes.";
    case "listening_help":
      return "Suggest how to listen effectively for THIS script (prediction, key words, note-taking). Do not invent facts not in the text.";
    case "reading_help":
      return "Give a tight reading strategy for THIS passage (skim → scan → infer). Optionally suggest 3 comprehension checks.";
    case "writing_ideas":
      return "Suggest ideas, outline bullets, and band-7 phrases that fit the prompt. Keep plagiarism-safe templates.";
    case "speaking_hints":
      return "Give concise cue bullets and sample sentence starters the learner can say aloud. Stay on-topic.";
    case "quiz_explain":
      return "Explain WHY the correct answer fits and contrast briefly with a tempting wrong option. Tutor tone.";
    case "vocab_deep":
      return "Expand with collocations, one synonym/antonym, register note, and two new example sentences using the word.";
    default:
      return "Help the learner practically and briefly.";
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
    "You are an IELTS General Training / CLB9 English coach inside a fixed curriculum app.",
    `Lesson day: ${parsed.day}. Section: ${parsed.section}.`,
    "Ground answers ONLY in the learner context below; do not invent curriculum facts.",
    "Write the entire answer in English only — no Persian/Farsi paragraphs, glosses, or summaries in your reply (the context may still contain Persian from the curriculum).",
    "Prefer plain, speech-friendly text: short paragraphs and simple lines starting with '- ' for bullets. Do NOT use markdown tables, fenced code blocks, ## headings, **bold**, __underscore__, or hash symbols — learners use read-aloud and symbols sound wrong.",
    taskDirective(parsed.task)
  ].join("\n");

  const userMsg = `### Context\n${ctx}`;

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
        (e.category === "bad_request" || e.category === "auth")
          ? e.message.slice(0, 240)
          : undefined;
      console.error("[api/ai/assist] LLM error", { code, category: e.category, message: e.message });
      return NextResponse.json(
        { error: "llm_failed", code, hint: safeHint },
        { status: 502 }
      );
    }
    console.error("[api/ai/assist] unexpected", e);
    return NextResponse.json({ error: "llm_failed", code: "UNKNOWN" }, { status: 502 });
  }
}
