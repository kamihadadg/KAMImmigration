import siteLocales from "./locales.json";

export const localeCookieName = siteLocales.localeCookieName;
export const defaultLocale = siteLocales.defaultLocale;
/** UI labels and codes — edit in `locales.json`, not here. */
export const languages = siteLocales.languages;

const codes = new Set(siteLocales.languages.map((l) => l.code));

if (!codes.has(siteLocales.defaultLocale)) {
  throw new Error(`locales.json: defaultLocale "${siteLocales.defaultLocale}" must appear in languages[].code`);
}

/** Any string that appears as `code` in `locales.json`. */
export type Locale = string;

export function isLocale(value: string | undefined): value is Locale {
  return typeof value === "string" && codes.has(value);
}

export type LanguageOption = (typeof siteLocales.languages)[number];
