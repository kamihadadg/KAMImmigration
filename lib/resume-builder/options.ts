import "server-only";

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { defaultDataPath } from "@/lib/resume-builder/default-data-paths";

const OPTION_SETS_FILE = "resume-option-sets.json";

type JsonRow = { key?: unknown; label?: unknown; values?: unknown };

function cleanValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function parseRows(): Array<{ key: string; label: string; values: string[] }> {
  const p = defaultDataPath(OPTION_SETS_FILE);
  if (!existsSync(p)) {
    throw new Error(`Missing defaults file: ${p}. Create content/defaults/resume-option-sets.json`);
  }
  const parsed = JSON.parse(readFileSync(p, "utf8")) as unknown;
  if (!Array.isArray(parsed)) throw new Error("resume-option-sets.json must be a JSON array");

  return parsed.map((row, i) => {
    if (!row || typeof row !== "object") throw new Error(`resume-option-sets.json: invalid row at index ${i}`);
    const r = row as JsonRow;
    if (typeof r.key !== "string" || typeof r.label !== "string") {
      throw new Error(`resume-option-sets.json: row ${i} needs string key and label`);
    }
    const vals = Array.isArray(r.values) ? r.values.map(String) : [];
    return { key: r.key.trim(), label: r.label.trim(), values: cleanValues(vals) };
  });
}

function fileMtimeIso(): string {
  try {
    return statSync(defaultDataPath(OPTION_SETS_FILE)).mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export type OptionSetKey = string;
export type OptionSets = Record<string, string[]>;

export type OptionSetRecord = {
  key: OptionSetKey;
  label: string;
  values: string[];
  updatedAt: string;
};

export function listOptionSetRecords(): OptionSetRecord[] {
  const mtime = fileMtimeIso();
  return parseRows().map((row) => ({
    key: row.key,
    label: row.label,
    values: row.values,
    updatedAt: mtime
  }));
}

export function getOptionSets(): OptionSets {
  const rows = parseRows();
  return Object.fromEntries(rows.map((r) => [r.key, r.values])) as OptionSets;
}

export function updateOptionSet(key: string, values: string[]) {
  const trimmedKey = key.trim();
  if (!trimmedKey) throw new Error("Key is required.");

  const rows = parseRows();
  const idx = rows.findIndex((r) => r.key === trimmedKey);
  if (idx === -1) throw new Error("Unknown option set.");

  rows[idx] = { ...rows[idx], values: cleanValues(values) };
  writeFileSync(defaultDataPath(OPTION_SETS_FILE), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}
