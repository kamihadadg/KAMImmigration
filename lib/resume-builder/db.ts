import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { academicProfileSchema, resumeProfileSchema, type ResumeRecord, type UserRecord } from "./schema";

const require = createRequire(import.meta.url);
const BetterSqlite3 = require("better-sqlite3") as any;

const dbPath = join(process.cwd(), "data", "resume-builder.sqlite");

let database: any | undefined;

export function getDb() {
  if (!database) {
    mkdirSync(dirname(dbPath), { recursive: true });
    database = new BetterSqlite3(dbPath);
    database.pragma("journal_mode = WAL");
    migrate(database);
  }
  return database;
}

function migrate(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      country TEXT NOT NULL,
      profile_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      blocks_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, day),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      target_country TEXT NOT NULL DEFAULT 'Netherlands',
      target_band TEXT NOT NULL DEFAULT 'CLB9',
      weekly_goal TEXT NOT NULL DEFAULT '5 study days',
      profile_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS option_sets (
      key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      values_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_accounts (
      user_id INTEGER PRIMARY KEY,
      credits INTEGER NOT NULL DEFAULT 10,
      plan TEXT NOT NULL DEFAULT 'Free',
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_unlocks (
      user_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      cost INTEGER NOT NULL DEFAULT 1,
      unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, day),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS export_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      resume_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      format TEXT NOT NULL,
      cost INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS credit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resume_targets (
      country TEXT PRIMARY KEY,
      targets_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS university_targets (
      country TEXT NOT NULL,
      field TEXT NOT NULL,
      targets_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (country, field)
    );
  `);

  const columns = db.prepare("PRAGMA table_info(learning_progress)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "blocks_json")) {
    db.exec("ALTER TABLE learning_progress ADD COLUMN blocks_json TEXT NOT NULL DEFAULT '{}'");
  }

  const resumeColumns = db.prepare("PRAGMA table_info(resumes)").all() as Array<{ name: string }>;
  if (!resumeColumns.some((column) => column.name === "kind")) {
    db.exec("ALTER TABLE resumes ADD COLUMN kind TEXT NOT NULL DEFAULT 'job'");
  }

  let settingsCols = db.prepare("PRAGMA table_info(user_settings)").all() as Array<{ name: string }>;
  if (!settingsCols.some((column) => column.name === "ai_model")) {
    db.exec("ALTER TABLE user_settings ADD COLUMN ai_model TEXT NOT NULL DEFAULT ''");
  }
  if (!settingsCols.some((column) => column.name === "ai_api_key_encrypted")) {
    db.exec("ALTER TABLE user_settings ADD COLUMN ai_api_key_encrypted TEXT NOT NULL DEFAULT ''");
  }
  settingsCols = db.prepare("PRAGMA table_info(user_settings)").all() as Array<{ name: string }>;
  if (!settingsCols.some((column) => column.name === "ai_provider")) {
    db.exec("ALTER TABLE user_settings ADD COLUMN ai_provider TEXT NOT NULL DEFAULT 'auto'");
  }

  const userVersion = Number(db.pragma("user_version", { simple: true }));
  if (userVersion < 2) {
    db.prepare("UPDATE user_accounts SET credits = 10 WHERE credits = 0").run();
    db.pragma("user_version = 2");
  }
}

export function mapUser(row: any): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at
  };
}

export function mapResume(row: any): ResumeRecord {
  const kind = row.kind === "academic" ? "academic" : "job";
  const base = {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    country: row.country,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  if (kind === "academic") {
    return {
      ...base,
      kind: "academic",
      profile: academicProfileSchema.parse(JSON.parse(row.profile_json))
    };
  }
  return {
    ...base,
    kind: "job",
    profile: resumeProfileSchema.parse(JSON.parse(row.profile_json))
  };
}
