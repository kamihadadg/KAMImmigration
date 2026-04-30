import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import siteLocales from "./locales.json";
import type { Locale } from "./config";

export type Messages = typeof en;

const bundles: Record<string, Messages> = {};
for (const { code } of siteLocales.languages) {
  if (code === "en") bundles[code] = en;
  else if (code === "fa") bundles[code] = fa as Messages;
}

export function getMessages(locale: Locale): Messages {
  const loaded = bundles[locale];
  if (loaded) return loaded;
  const fallback = bundles[siteLocales.defaultLocale];
  return fallback ?? en;
}
