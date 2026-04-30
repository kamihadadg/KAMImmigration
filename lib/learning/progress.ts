import "server-only";

import { getDb } from "@/lib/resume-builder/db";

export type LearningProgress = {
  day: number;
  completed: boolean;
  notes: string;
  blocks: Record<string, boolean>;
  updatedAt: string;
};

function parseBlocks(value: unknown): Record<string, boolean> {
  if (typeof value !== "string" || !value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, checked]) => [key, Boolean(checked)]));
  } catch {
    return {};
  }
}

function mapProgress(row: any): LearningProgress {
  return {
    day: row.day,
    completed: Boolean(row.completed),
    notes: row.notes,
    blocks: parseBlocks(row.blocks_json),
    updatedAt: row.updated_at
  };
}

export function listProgress(userId: number): LearningProgress[] {
  return getDb()
    .prepare("SELECT day, completed, notes, blocks_json, updated_at FROM learning_progress WHERE user_id = ? ORDER BY day ASC")
    .all(userId)
    .map(mapProgress);
}

export function getDayProgress(userId: number, day: number): LearningProgress {
  const row = getDb().prepare("SELECT day, completed, notes, blocks_json, updated_at FROM learning_progress WHERE user_id = ? AND day = ?").get(userId, day);
  return row ? mapProgress(row) : { day, completed: false, notes: "", blocks: {}, updatedAt: "" };
}

export function upsertProgress(userId: number, day: number, completed: boolean, notes: string, blocks: Record<string, boolean> = {}) {
  getDb()
    .prepare(
      `INSERT INTO learning_progress (user_id, day, completed, notes, blocks_json, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, day) DO UPDATE SET
         completed = excluded.completed,
         notes = excluded.notes,
         blocks_json = excluded.blocks_json,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(userId, day, completed ? 1 : 0, notes, JSON.stringify(blocks));
}

export function updateProgressBlocks(userId: number, day: number, blocks: Record<string, boolean>) {
  const current = getDayProgress(userId, day);
  upsertProgress(userId, day, current.completed, current.notes, blocks);
}

export function getProgressSummary(userId: number) {
  const rows = listProgress(userId);
  const completedDays = rows.filter((row) => row.completed).length;
  const lastActiveDay = rows.length ? Math.max(...rows.map((row) => row.day)) : 1;
  return {
    rows,
    completedDays,
    lastActiveDay,
    nextDay: Math.max(1, lastActiveDay + (rows.some((row) => row.day === lastActiveDay && row.completed) ? 1 : 0))
  };
}
