import type { Messages } from "@/lib/i18n/messages";

/** Localized badge text for university catalog `type` (University / Business school / Technical university). */
export function schoolTypeLabel(messages: Messages, type: string): string {
  const key = type.trim();
  const map = messages.targetsPage.schoolTypes;
  if (key && map && typeof map === "object" && key in map) return map[key as keyof typeof map];
  return key || messages.targetsPage.schoolTypesFallback;
}
