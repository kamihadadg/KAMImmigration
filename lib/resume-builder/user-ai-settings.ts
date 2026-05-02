import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { inferDefaultLlmModel, type AiProviderPreference } from "@/lib/ai/provider";
import { getDb } from "./db";

const KDF_SALT = "kam-ai-api-key-v1";

function deriveKey(): Buffer {
  const secret =
    process.env.AI_KEY_ENCRYPTION_SECRET || process.env.RESUME_BUILDER_SECRET || process.env.NEXTAUTH_SECRET || "local-dev-resume-builder-secret";
  return scryptSync(secret, KDF_SALT, 32);
}

export function encryptUserApiKey(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plain.trim(), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptUserApiKey(encoded: string): string | null {
  if (!encoded) return null;
  try {
    const buf = Buffer.from(encoded, "base64url");
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function ensureUserSettingsRow(userId: number) {
  getDb().prepare(`INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)`).run(userId);
}

export function normalizeAiProviderPreference(raw: string | undefined): AiProviderPreference {
  const s = (raw ?? "auto").trim().toLowerCase();
  if (s === "gemini") return "gemini";
  if (s === "openai") return "openai";
  return "auto";
}

export type UserAiProfileFields = {
  aiModel: string;
  aiProvider: AiProviderPreference;
  hasStoredApiKey: boolean;
};

export function getUserAiProfileFields(userId: number): UserAiProfileFields {
  ensureUserSettingsRow(userId);
  const row = getDb()
    .prepare(`SELECT ai_model, ai_provider, ai_api_key_encrypted FROM user_settings WHERE user_id = ?`)
    .get(userId) as { ai_model?: string; ai_provider?: string; ai_api_key_encrypted?: string } | undefined;
  return {
    aiModel: (row?.ai_model ?? "").trim(),
    aiProvider: normalizeAiProviderPreference(row?.ai_provider),
    hasStoredApiKey: Boolean(row?.ai_api_key_encrypted)
  };
}

export type UpdateUserAiPrefsInput = {
  model: string;
  provider: AiProviderPreference;
  /** New key; if empty, existing ciphertext is kept unless clearApiKey is true */
  apiKey: string;
  clearApiKey: boolean;
};

export function updateUserAiPreferences(userId: number, input: UpdateUserAiPrefsInput) {
  ensureUserSettingsRow(userId);
  const db = getDb();
  const row = db.prepare(`SELECT ai_api_key_encrypted FROM user_settings WHERE user_id = ?`).get(userId) as { ai_api_key_encrypted?: string } | undefined;
  let nextEnc = row?.ai_api_key_encrypted ?? "";
  if (input.clearApiKey) nextEnc = "";
  else if (input.apiKey.trim()) nextEnc = encryptUserApiKey(input.apiKey);

  const provider = normalizeAiProviderPreference(input.provider);

  db.prepare(
    `UPDATE user_settings SET ai_model = ?, ai_api_key_encrypted = ?, ai_provider = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`
  ).run(input.model.trim(), nextEnc, provider, userId);
}

/** User key if set, else platform env; model from profile or env default; provider from profile */
export function getEffectiveLlmConfig(userId: number): {
  apiKey: string;
  model: string;
  usingUserKey: boolean;
  aiProvider: AiProviderPreference;
} {
  ensureUserSettingsRow(userId);
  const row = getDb()
    .prepare(`SELECT ai_model, ai_provider, ai_api_key_encrypted FROM user_settings WHERE user_id = ?`)
    .get(userId) as { ai_model?: string; ai_provider?: string; ai_api_key_encrypted?: string } | undefined;

  const platformKey = (process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "").trim();

  const userModel = (row?.ai_model ?? "").trim();
  const aiProvider = normalizeAiProviderPreference(row?.ai_provider);
  const decrypted = row?.ai_api_key_encrypted ? decryptUserApiKey(row.ai_api_key_encrypted) : null;
  const userKey = decrypted?.trim() ?? "";

  const usingUserKey = userKey.length > 0;
  const apiKey = usingUserKey ? userKey : platformKey;
  return {
    apiKey,
    model: userModel || inferDefaultLlmModel(apiKey, aiProvider),
    usingUserKey,
    aiProvider
  };
}
