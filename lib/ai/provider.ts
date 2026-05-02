import "server-only";

/** Google AI Studio Gemini via OpenAI-compatible REST (Bearer API key). @see https://ai.google.dev/gemini-api/docs/openai */
export const GEMINI_OPENAI_COMPAT_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";

export const OPENAI_DEFAULT_BASE = "https://api.openai.com/v1";

/** Stable model id for Gemini when profile/env still mention OpenAI models */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Saved in profile `ai_provider`; drives API host when `LLM_API_BASE` is unset */
export type AiProviderPreference = "auto" | "gemini" | "openai";

function isOpenAiStyleModelId(m: string): boolean {
  const s = m.trim().toLowerCase();
  return (
    s.startsWith("gpt-") ||
    /^o[0-9]/.test(s) ||
    s.startsWith("claude") ||
    s.startsWith("davinci") ||
    s.startsWith("text-embedding") ||
    s.startsWith("text-davinci")
  );
}

function isGeminiHost(baseUrl: string): boolean {
  return baseUrl.includes("generativelanguage.googleapis.com");
}

/**
 * Chat completions base URL without trailing slash.
 * `LLM_API_BASE` wins when set.
 * Otherwise: explicit profile/server preference → heuristics (`LLM_PROVIDER`, `AIza` key prefix, env-only `GEMINI_API_KEY`).
 */
export function resolveLlmApiBase(apiKey: string, preference: AiProviderPreference = "auto"): string {
  const custom = process.env.LLM_API_BASE?.trim().replace(/\/$/, "");
  if (custom) return custom;

  if (preference === "gemini") return GEMINI_OPENAI_COMPAT_BASE;
  if (preference === "openai") return OPENAI_DEFAULT_BASE;

  const provider = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (provider === "gemini" || provider === "google") {
    return GEMINI_OPENAI_COMPAT_BASE;
  }

  const key = apiKey.trim();
  if (key.startsWith("AIza")) {
    return GEMINI_OPENAI_COMPAT_BASE;
  }

  const geminiEnv = process.env.GEMINI_API_KEY?.trim();
  const openaiEnv = (process.env.LLM_API_KEY || process.env.OPENAI_API_KEY)?.trim();
  if (geminiEnv && !openaiEnv && key === geminiEnv) {
    return GEMINI_OPENAI_COMPAT_BASE;
  }

  return OPENAI_DEFAULT_BASE;
}

/**
 * Default model when profile field is empty.
 * If `LLM_MODEL` is an OpenAI-style id but the resolved host is Gemini, ignore it (common misconfiguration).
 */
export function inferDefaultLlmModel(apiKey: string, preference: AiProviderPreference = "auto"): string {
  const geminiHost = isGeminiHost(resolveLlmApiBase(apiKey, preference));
  const envModel = process.env.LLM_MODEL?.trim();

  if (envModel) {
    if (geminiHost && isOpenAiStyleModelId(envModel)) {
      return DEFAULT_GEMINI_MODEL;
    }
    return envModel;
  }

  return geminiHost ? DEFAULT_GEMINI_MODEL : "gpt-4o-mini";
}

/**
 * Final model string sent to the provider. Strips `models/` and maps OpenAI names → Gemini default when host is Google.
 */
export function coerceModelForProvider(model: string, apiKey: string, preference: AiProviderPreference = "auto"): string {
  const geminiHost = isGeminiHost(resolveLlmApiBase(apiKey, preference));
  const m = model.trim().replace(/^models\//i, "");

  if (!m) return inferDefaultLlmModel(apiKey, preference);

  if (geminiHost && isOpenAiStyleModelId(m)) {
    return DEFAULT_GEMINI_MODEL;
  }

  return m;
}
