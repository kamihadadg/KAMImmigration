import "server-only";

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { defaultDataPath } from "@/lib/resume-builder/default-data-paths";
import type { ResumeTarget } from "@/lib/resume-builder/resume-target-types";
import {
  canonicalUniversityCountry,
  readUniFlatRows,
  uniCatalogFileMtime,
  updateUniversityCatalogField
} from "@/lib/resume-builder/university-catalog";

export { ORDERED_UNIVERSITY_COUNTRIES, isAllowedUniversityCountry } from "@/lib/resume-builder/university-catalog";

export type { ResumeTarget } from "@/lib/resume-builder/resume-target-types";
export type { UniversityCatalogEntry, UniversityCountryBlock } from "@/lib/resume-builder/university-catalog";

export type ResumeTargetList = {
  country: string;
  targets: ResumeTarget[];
  updatedAt: string;
};

export type UniversityTargetList = {
  country: string;
  field: string;
  targets: ResumeTarget[];
  updatedAt: string;
};

const WORK_FILE = "work-targets.json";

function isoMtime(path: string): string {
  try {
    return statSync(path).mtime.toISOString();
  } catch {
    return "";
  }
}

export function cleanTarget(target: ResumeTarget): ResumeTarget {
  return {
    type: target.type?.trim() || "Target",
    name: target.name?.trim() || "Unnamed target",
    url: target.url?.trim() || "",
    email: target.email?.trim() || "",
    location: target.location?.trim() || "",
    notes: target.notes?.trim() || "",
    tags: Array.from(new Set((target.tags ?? []).map((tag) => tag.trim()).filter(Boolean)))
  };
}

function readWorkJson(): Array<{ country: string; targets: ResumeTarget[] }> {
  const p = defaultDataPath(WORK_FILE);
  if (!existsSync(p)) throw new Error(`Missing ${p}`);
  const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error("work-targets.json must be an array");
  return raw.map((row, i) => {
    if (!row || typeof row !== "object") throw new Error(`work-targets.json: invalid row ${i}`);
    const r = row as { country?: unknown; targets?: unknown };
    const country = typeof r.country === "string" ? r.country.trim() : "";
    if (!country) throw new Error(`work-targets.json: row ${i} missing country`);
    const targets = Array.isArray(r.targets) ? r.targets.map((t) => cleanTarget(t as ResumeTarget)).filter((t) => t.name) : [];
    return { country, targets };
  });
}

function writeWorkJson(rows: Array<{ country: string; targets: ResumeTarget[] }>) {
  writeFileSync(defaultDataPath(WORK_FILE), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export function listResumeTargetLists(): ResumeTargetList[] {
  const path = defaultDataPath(WORK_FILE);
  const updatedAt = isoMtime(path);
  return readWorkJson().map((row) => ({
    country: row.country,
    targets: row.targets,
    updatedAt
  }));
}

export function getResumeTargetList(country: string): ResumeTargetList {
  const normalizedCountry = country.trim() || "Netherlands";
  const path = defaultDataPath(WORK_FILE);
  const updatedAt = isoMtime(path);
  const row = readWorkJson().find((r) => r.country === normalizedCountry);
  return row ? { country: row.country, targets: row.targets, updatedAt } : { country: normalizedCountry, targets: [], updatedAt: "" };
}

export function updateResumeTargetList(country: string, targets: ResumeTarget[]) {
  const normalizedCountry = country.trim();
  if (!normalizedCountry) throw new Error("Country is required.");

  const cleaned = targets.map(cleanTarget).filter((target) => target.name);
  const rows = readWorkJson();
  const idx = rows.findIndex((r) => r.country === normalizedCountry);
  if (idx >= 0) rows[idx] = { country: normalizedCountry, targets: cleaned };
  else rows.push({ country: normalizedCountry, targets: cleaned });
  rows.sort((a, b) => a.country.localeCompare(b.country, undefined, { sensitivity: "base" }));
  writeWorkJson(rows);
}

export function targetsToText(targets: ResumeTarget[]) {
  return targets
    .map((target) => [target.type, target.name, target.url, target.email, target.location, target.notes, target.tags.join(", ")].join(" | "))
    .join("\n");
}

export function textToTargets(value: string): ResumeTarget[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [type = "", name = "", url = "", email = "", location = "", notes = "", tags = ""] = line.split("|").map((part) => part.trim());
      return cleanTarget({
        type,
        name,
        url,
        email,
        location,
        notes,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      });
    })
    .filter((target) => target.name);
}

export function listUniversityTargetLists(): UniversityTargetList[] {
  const updatedAt = uniCatalogFileMtime();
  return readUniFlatRows().map((row) => ({
    country: row.country,
    field: row.field,
    targets: row.targets,
    updatedAt
  }));
}

export function listUniversityFieldsForCountry(country: string): string[] {
  const normalized = canonicalUniversityCountry(country.trim() || "United States");
  const flat = readUniFlatRows();
  const fields = flat.filter((r) => r.country === normalized).map((r) => r.field);
  return Array.from(new Set(fields)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function getUniversityTargetList(country: string, field: string): UniversityTargetList {
  const c = canonicalUniversityCountry(country.trim() || "United States");
  const f = field.trim();
  const updatedAt = uniCatalogFileMtime();

  if (!f) {
    const fields = listUniversityFieldsForCountry(c);
    const first = fields[0] ?? "";
    if (!first) return { country: c, field: "", targets: [], updatedAt: "" };
    return getUniversityTargetList(c, first);
  }

  const row = readUniFlatRows().find((r) => r.country === c && r.field === f);
  return row ? { country: row.country, field: row.field, targets: row.targets, updatedAt } : { country: c, field: f, targets: [], updatedAt: "" };
}

export function updateUniversityTargetList(country: string, field: string, targets: ResumeTarget[]) {
  updateUniversityCatalogField(country, field, targets);
}
