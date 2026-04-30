import type { Messages } from "./messages";

export function interpolate(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

export function t(messages: Messages, path: string, vars?: Record<string, string | number>): string {
  const parts = path.split(".");
  let cur: unknown = messages as unknown as Record<string, unknown>;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = (cur as Record<string, unknown>)[p];
    else return path;
  }
  const out = typeof cur === "string" ? cur : path;
  return vars ? interpolate(out, vars) : out;
}
