import "server-only";

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { defaultDataPath } from "@/lib/resume-builder/default-data-paths";
import type { ResumeTarget } from "@/lib/resume-builder/resume-target-types";

export type UniversityCatalogEntry = {
  type: string;
  name: string;
  ranking_world?: number | null;
  fields: string[];
  notes?: string;
  url?: string;
  email?: string;
  location?: string;
};

export type UniversityCountryBlock = {
  country: string;
  universities: UniversityCatalogEntry[];
};

const UNI_FILE = "university-targets.json";

/** Allowed university-target countries (UI order). Admin saves outside this set are rejected. */
export const ORDERED_UNIVERSITY_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Finland",
  "Netherlands",
  "Spain",
  "Italy",
  "Sweden",
  "Germany",
  "Turkey",
  "Austria",
  "Australia"
] as const;

const ALLOWED_UNIVERSITY_COUNTRY_SET = new Set<string>(ORDERED_UNIVERSITY_COUNTRIES);

/** Align short labels with full names used in resume option sets / legacy data */
const COUNTRY_CANONICAL: Record<string, string> = {
  usa: "United States",
  us: "United States",
  "u.s.a.": "United States",
  "united states of america": "United States",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
  "great britain": "United Kingdom",
  britain: "United Kingdom",
  england: "United Kingdom",
  scotland: "United Kingdom",
  wales: "United Kingdom",
  nl: "Netherlands",
  holland: "Netherlands",
  finland: "Finland",
  spain: "Spain",
  españa: "Spain",
  italy: "Italy",
  italia: "Italy",
  turkey: "Turkey",
  turkiye: "Turkey",
  türkiye: "Turkey",
  uae: "United Arab Emirates",
  emirates: "United Arab Emirates"
};

export function isAllowedUniversityCountry(country: string): boolean {
  return ALLOWED_UNIVERSITY_COUNTRY_SET.has(canonicalUniversityCountry(country.trim()));
}

function sortCountryBlocksInCatalogOrder(blocks: UniversityCountryBlock[]): void {
  const orderIndex = new Map<string, number>(ORDERED_UNIVERSITY_COUNTRIES.map((c, i) => [c, i]));
  blocks.sort((a, b) => (orderIndex.get(a.country) ?? 999) - (orderIndex.get(b.country) ?? 999));
}

export function canonicalUniversityCountry(c: string): string {
  const t = c.trim();
  if (!t) return t;
  const mapped = COUNTRY_CANONICAL[t.toLowerCase()];
  return mapped ?? t;
}

export function normalizeUniName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function cleanResumeRow(target: ResumeTarget): ResumeTarget {
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

function isoMtime(path: string): string {
  try {
    return statSync(path).mtime.toISOString();
  } catch {
    return "";
  }
}

function isNewUniversityFileShape(raw: unknown[]): boolean {
  const first = raw[0];
  if (!first || typeof first !== "object") return false;
  return "universities" in first && Array.isArray((first as { universities?: unknown }).universities);
}

function parseCatalogEntry(x: unknown, index: number): UniversityCatalogEntry {
  if (!x || typeof x !== "object") throw new Error(`university-targets.json: invalid university at index ${index}`);
  const u = x as Record<string, unknown>;
  const name = typeof u.name === "string" ? u.name.trim() : "";
  if (!name) throw new Error(`university-targets.json: university ${index} missing name`);

  const fieldsRaw = u.fields;
  const fields = Array.isArray(fieldsRaw) ? fieldsRaw.map((f) => String(f).trim()).filter(Boolean) : [];

  let ranking_world: number | null | undefined;
  if ("ranking_world" in u) {
    const r = u.ranking_world;
    if (r === null || r === undefined) ranking_world = null;
    else if (typeof r === "number" && Number.isFinite(r)) ranking_world = Math.round(r);
    else if (typeof r === "string" && /^\d+$/.test(r.trim())) ranking_world = Number.parseInt(r.trim(), 10);
    else ranking_world = null;
  }

  return {
    type: typeof u.type === "string" && u.type.trim() ? u.type.trim() : "University",
    name,
    ...(ranking_world !== undefined ? { ranking_world } : {}),
    fields,
    notes: typeof u.notes === "string" ? u.notes : "",
    url: typeof u.url === "string" ? u.url : "",
    email: typeof u.email === "string" ? u.email : "",
    location: typeof u.location === "string" ? u.location : ""
  };
}

function parseNewBlocks(raw: unknown[]): UniversityCountryBlock[] {
  const blocks = raw
    .map((item, i) => {
      if (!item || typeof item !== "object") throw new Error(`university-targets.json: invalid block ${i}`);
      const row = item as Record<string, unknown>;
      const country = canonicalUniversityCountry(typeof row.country === "string" ? row.country : "");
      const uniRaw = row.universities;
      const universities = Array.isArray(uniRaw)
        ? uniRaw.map((u, j) => parseCatalogEntry(u, j))
        : [];
      if (!country) throw new Error(`university-targets.json: block ${i} missing country`);
      return { country, universities };
    })
    .filter((b) => isAllowedUniversityCountry(b.country));
  sortCountryBlocksInCatalogOrder(blocks);
  return blocks;
}

type LegacyUniRow = { country: string; field: string; targets: ResumeTarget[] };

function parseLegacyUniRows(raw: unknown[]): LegacyUniRow[] {
  return raw.map((row, i) => {
    if (!row || typeof row !== "object") throw new Error(`university-targets.json: invalid legacy row ${i}`);
    const r = row as { country?: unknown; field?: unknown; targets?: unknown };
    const country = canonicalUniversityCountry(typeof r.country === "string" ? r.country : "");
    const field = typeof r.field === "string" ? r.field.trim() : "";
    if (!country || !field) throw new Error(`university-targets.json: legacy row ${i} needs country and field`);
    const targets = Array.isArray(r.targets)
      ? r.targets.map((t) => cleanResumeRow(t as ResumeTarget)).filter((t) => t.name)
      : [];
    return { country, field, targets };
  });
}

function legacyRowsToBlocks(rows: LegacyUniRow[]): UniversityCountryBlock[] {
  const byCountry = new Map<string, Map<string, UniversityCatalogEntry>>();

  for (const row of rows) {
    const country = row.country;
    let nm = byCountry.get(country);
    if (!nm) {
      nm = new Map();
      byCountry.set(country, nm);
    }
    for (const t of row.targets) {
      const key = normalizeUniName(t.name);
      let u = nm.get(key);
      if (!u) {
        u = {
          type: t.type?.trim() || "University",
          name: t.name.trim(),
          ranking_world: null,
          fields: [],
          notes: (t.notes || "").trim(),
          url: (t.url || "").trim(),
          email: (t.email || "").trim(),
          location: (t.location || "").trim()
        };
        nm.set(key, u);
      }
      if (!u.fields.includes(row.field)) u.fields.push(row.field);
    }
  }

  return [...byCountry.entries()]
    .map(([country, nm]) => ({
      country,
      universities: [...nm.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    }))
    .sort((a, b) => a.country.localeCompare(b.country, undefined, { sensitivity: "base" }));
}

export function loadUniversityBlocks(): UniversityCountryBlock[] {
  const p = defaultDataPath(UNI_FILE);
  if (!existsSync(p)) throw new Error(`Missing ${p}`);
  const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error("university-targets.json must be an array");
  if (raw.length === 0) return [];
  if (isNewUniversityFileShape(raw)) return parseNewBlocks(raw as unknown[]);
  const blocks = legacyRowsToBlocks(parseLegacyUniRows(raw)).filter((b) => isAllowedUniversityCountry(b.country));
  sortCountryBlocksInCatalogOrder(blocks);
  writeUniversityBlocks(blocks);
  return blocks;
}

const RANK_PREFIX = /^World rank ~(\d+)\.\s*/i;

export function parseRankingFromNotes(notes: string): { ranking: number | null; rest: string } {
  const m = notes.trim().match(RANK_PREFIX);
  if (!m) return { ranking: null, rest: notes.trim() };
  return { ranking: Number.parseInt(m[1], 10), rest: notes.slice(m[0].length).trim() };
}

export function catalogToResumeTarget(u: UniversityCatalogEntry): ResumeTarget {
  const rankPart = u.ranking_world != null ? `World rank ~${u.ranking_world}. ` : "";
  const notes = `${rankPart}${u.notes ?? ""}`.trim();
  const tags = [...u.fields];
  if (u.ranking_world != null) tags.push(`Rank ~${u.ranking_world}`);
  return cleanResumeRow({
    type: u.type || "University",
    name: u.name,
    url: u.url || "",
    email: u.email || "",
    location: u.location || "",
    notes,
    tags: Array.from(new Set(tags))
  });
}

export function expandBlocksToFlat(blocks: UniversityCountryBlock[]): Array<{ country: string; field: string; targets: ResumeTarget[] }> {
  const rows: Array<{ country: string; field: string; targets: ResumeTarget[] }> = [];

  for (const block of blocks) {
    const fieldSet = new Set<string>();
    for (const u of block.universities) {
      for (const f of u.fields) {
        const ft = f.trim();
        if (ft) fieldSet.add(ft);
      }
    }
    const sortedFields = [...fieldSet].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    for (const field of sortedFields) {
      const targets = block.universities.filter((u) => u.fields.includes(field)).map(catalogToResumeTarget);
      rows.push({ country: block.country, field, targets });
    }
  }

  const orderIndex = new Map<string, number>(ORDERED_UNIVERSITY_COUNTRIES.map((c, i) => [c, i]));
  rows.sort((a, b) => {
    const ca = orderIndex.get(a.country) ?? 999;
    const cb = orderIndex.get(b.country) ?? 999;
    if (ca !== cb) return ca - cb;
    return a.field.localeCompare(b.field, undefined, { sensitivity: "base" });
  });
  return rows;
}

export function readUniFlatRows(): Array<{ country: string; field: string; targets: ResumeTarget[] }> {
  return expandBlocksToFlat(loadUniversityBlocks());
}

export function writeUniversityBlocks(blocks: UniversityCountryBlock[]) {
  const ordered = [...blocks];
  sortCountryBlocksInCatalogOrder(ordered);

  const serialized = ordered.map((b) => ({
    country: b.country,
    universities: [...b.universities]
      .sort((a, x) => a.name.localeCompare(x.name, undefined, { sensitivity: "base" }))
      .map((u) => {
        const o: Record<string, unknown> = {
          type: u.type,
          name: u.name,
          fields: u.fields,
          notes: u.notes ?? ""
        };
        if (u.ranking_world != null && typeof u.ranking_world === "number" && Number.isFinite(u.ranking_world)) {
          o.ranking_world = u.ranking_world;
        }
        if (u.url) o.url = u.url;
        if (u.email) o.email = u.email;
        if (u.location) o.location = u.location;
        return o;
      })
  }));

  writeFileSync(defaultDataPath(UNI_FILE), `${JSON.stringify(serialized, null, 2)}\n`, "utf8");
}

export function uniCatalogFileMtime(): string {
  return isoMtime(defaultDataPath(UNI_FILE));
}

export function updateUniversityCatalogField(country: string, field: string, targets: ResumeTarget[]) {
  const c = canonicalUniversityCountry(country.trim());
  const f = field.trim();
  if (!c) throw new Error("Country is required.");
  if (!isAllowedUniversityCountry(c)) {
    throw new Error(`Country "${c}" is not allowed. Use one of: ${ORDERED_UNIVERSITY_COUNTRIES.join(", ")}`);
  }
  if (!f) throw new Error("Field of study is required.");

  const blocks = loadUniversityBlocks();
  let block = blocks.find((b) => b.country === c);
  if (!block) {
    block = { country: c, universities: [] };
    blocks.push(block);
  }

  for (const u of block.universities) {
    u.fields = u.fields.filter((x) => x !== f);
  }
  block.universities = block.universities.filter((u) => u.fields.length > 0);

  const cleaned = targets.map(cleanResumeRow).filter((t) => t.name);

  for (const t of cleaned) {
    const key = normalizeUniName(t.name);
    let u = block.universities.find((x) => normalizeUniName(x.name) === key);
    const fromNotes = parseRankingFromNotes(t.notes);

    if (!u) {
      u = {
        type: t.type?.trim() || "University",
        name: t.name.trim(),
        ranking_world: fromNotes.ranking,
        fields: [],
        notes: fromNotes.rest,
        url: (t.url || "").trim(),
        email: (t.email || "").trim(),
        location: (t.location || "").trim()
      };
      block.universities.push(u);
    }

    if (!u.fields.includes(f)) u.fields.push(f);

    if (fromNotes.ranking != null) u.ranking_world = fromNotes.ranking;
    u.notes = fromNotes.rest || u.notes;
    if ((t.url || "").trim()) u.url = (t.url || "").trim();
    if ((t.email || "").trim()) u.email = (t.email || "").trim();
    if ((t.location || "").trim()) u.location = (t.location || "").trim();
    u.type = (t.type || "").trim() || u.type;
  }

  sortCountryBlocksInCatalogOrder(blocks);
  writeUniversityBlocks(blocks);
}
