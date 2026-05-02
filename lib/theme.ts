export const APP_THEME_COOKIE = "kam-backlit-theme";
export const APP_THEME_STORAGE = "kam-backlit-theme";

export type AppBacklitTheme = "day" | "night";

export function parseAppTheme(raw: string | undefined): AppBacklitTheme {
  return raw === "day" || raw === "night" ? raw : "night";
}
