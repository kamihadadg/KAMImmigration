import "server-only";

import { getDb } from "./db";

export const optionSetDefinitions = [
  { key: "countries", label: "Target countries / markets", values: ["Netherlands", "Canada", "United States", "United Kingdom", "Germany", "Remote"] },
  { key: "locations", label: "Preferred cities / locations", values: ["Amsterdam", "Rotterdam", "Eindhoven", "Utrecht", "Toronto", "Vancouver", "New York", "San Francisco", "Seattle", "London", "Cambridge", "Berlin", "Munich", "Remote / Hybrid"] },
  { key: "nationalities", label: "Nationalities", values: ["Iranian"] },
  { key: "targetRoles", label: "Target roles", values: ["Software Architect", "Solution Architect", "Technical Lead", "Backend Architect", "Platform Architect", "Engineering Manager", "Senior Backend Engineer"] },
  { key: "employmentTypes", label: "Employment types", values: ["Full-time", "Contract", "Part-time", "Freelance", "Remote", "Hybrid"] },
  { key: "skillGroups", label: "Skill groups", values: ["Languages", "Backend", "Frontend", "Architecture", "DevOps & Infrastructure", "Data & BI", "AI & Automation", "Leadership"] },
  { key: "technologies", label: "Technologies", values: ["Node.js", "TypeScript", "JavaScript", "Python", "React", "Next.js", "NestJS", "FastAPI", "SQL", "MSSQL", "PostgreSQL", "Docker", "Linux", "Nginx", "Cloudflare", "VMware ESXi", "Power BI", "QlikView", "MQTT"] },
  { key: "projectRoles", label: "Project roles", values: ["Founder", "Architect", "Full-stack Developer", "Backend Developer", "Technical Lead", "Product Owner"] },
  { key: "degrees", label: "Degrees", values: ["B.Sc.", "M.Sc.", "Ph.D.", "Diploma", "Certificate"] },
  { key: "fieldsOfStudy", label: "Fields of study", values: ["Computer Engineering", "Computer Hardware Engineering", "Software Engineering", "Information Technology", "Industrial Engineering", "Food Science"] },
  { key: "schools", label: "Schools / universities", values: ["Islamic Azad University"] },
  { key: "languages", label: "Languages", values: ["Persian: Native", "English: Professional Working Proficiency", "Turkish: Fluent"] },
  { key: "availability", label: "Availability / notice periods", values: ["Immediately available", "Available in 1 month", "Available in 2 months", "Available for remote interviews; relocation timeline negotiable"] }
] as const;

export type OptionSetKey = (typeof optionSetDefinitions)[number]["key"];
export type OptionSets = Record<OptionSetKey, string[]>;

export type OptionSetRecord = {
  key: OptionSetKey;
  label: string;
  values: string[];
  updatedAt: string;
};

function cleanValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function parseValues(value: unknown) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? cleanValues(parsed.map(String)) : [];
  } catch {
    return [];
  }
}

function ensureDefaultOptionSets() {
  const db = getDb();
  const statement = db.prepare("INSERT OR IGNORE INTO option_sets (key, label, values_json) VALUES (?, ?, ?)");
  optionSetDefinitions.forEach((set) => {
    statement.run(set.key, set.label, JSON.stringify(set.values));
  });
}

export function listOptionSetRecords(): OptionSetRecord[] {
  ensureDefaultOptionSets();
  const rows = getDb().prepare("SELECT key, label, values_json, updated_at FROM option_sets ORDER BY label").all() as Array<{
    key: OptionSetKey;
    label: string;
    values_json: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    values: parseValues(row.values_json),
    updatedAt: row.updated_at
  }));
}

export function getOptionSets(): OptionSets {
  const records = listOptionSetRecords();
  return Object.fromEntries(records.map((record) => [record.key, record.values])) as OptionSets;
}

export function updateOptionSet(key: string, values: string[]) {
  const definition = optionSetDefinitions.find((set) => set.key === key);
  if (!definition) throw new Error("Unknown option set.");

  getDb()
    .prepare(
      `INSERT INTO option_sets (key, label, values_json, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         values_json = excluded.values_json,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(definition.key, definition.label, JSON.stringify(cleanValues(values)));
}
