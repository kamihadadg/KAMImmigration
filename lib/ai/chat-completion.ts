import "server-only";

import { coerceModelForProvider, resolveLlmApiBase, type AiProviderPreference } from "@/lib/ai/provider";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatCompletionErrorCategory = "auth" | "rate_limit" | "bad_request" | "server" | "network" | "timeout" | "parse";

export class ChatCompletionError extends Error {
  readonly category: ChatCompletionErrorCategory;

  constructor(category: ChatCompletionErrorCategory, message: string) {
    super(message);
    this.name = "ChatCompletionError";
    this.category = category;
  }
}

const TIMEOUT_MS = 90_000;

function extractProviderMessage(rawText: string): string | undefined {
  try {
    const j = JSON.parse(rawText) as unknown;
    if (Array.isArray(j) && j[0] && typeof j[0] === "object" && j[0] !== null && "error" in (j[0] as object)) {
      const msg = (j[0] as { error?: { message?: string } }).error?.message?.trim();
      if (msg) return msg;
    }
    const obj = j as { error?: { message?: string } };
    return obj.error?.message?.trim();
  } catch {
    return undefined;
  }
}

export async function createChatCompletion(opts: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  providerPreference?: AiProviderPreference;
}): Promise<string> {
  const pref = opts.providerPreference ?? "auto";
  const baseRaw = resolveLlmApiBase(opts.apiKey, pref);
  const url = `${baseRaw}/chat/completions`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.apiKey}`,
    "Content-Type": "application/json"
  };
  const referer = process.env.LLM_HTTP_REFERER?.trim();
  if (referer) headers["HTTP-Referer"] = referer;
  const title = process.env.LLM_APP_TITLE?.trim();
  if (title) headers["X-Title"] = title;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: coerceModelForProvider(opts.model, opts.apiKey, pref),
        messages: opts.messages,
        temperature: 0.65,
        max_tokens: opts.maxTokens ?? 1600
      }),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      throw new ChatCompletionError("timeout", "LLM request timed out");
    }
    throw new ChatCompletionError("network", e instanceof Error ? e.message : "fetch failed");
  }
  clearTimeout(timeoutId);

  const rawText = await res.text();

  if (!res.ok) {
    const providerMsg = extractProviderMessage(rawText);
    const hint = providerMsg || rawText.slice(0, 280);

    if (res.status === 401 || res.status === 403) {
      throw new ChatCompletionError("auth", hint);
    }
    if (res.status === 429) {
      throw new ChatCompletionError("rate_limit", hint);
    }
    if (res.status === 400) {
      throw new ChatCompletionError("bad_request", hint);
    }
    throw new ChatCompletionError("server", hint);
  }

  let data: { choices?: Array<{ message?: { content?: string | null } }> };
  try {
    data = JSON.parse(rawText) as typeof data;
  } catch {
    throw new ChatCompletionError("parse", "LLM response was not JSON");
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new ChatCompletionError("parse", "Empty LLM completion");
  return content;
}
