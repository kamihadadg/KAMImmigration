import "server-only";

import { getDb } from "./db";

export type AdminUserAccount = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  credits: number;
  plan: string;
  status: "active" | "suspended";
  notes: string;
  updatedAt: string;
  resumeCount: number;
  exportCount: number;
  completedLessons: number;
  unlockedLessons: number;
};

export type CreditRequestRecord = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

const validStatuses = new Set(["active", "suspended"]);
/** Starter balance for new accounts (no separate free-tier quotas). */
export const DEFAULT_STARTING_CREDITS = 10;
export const FREE_RESUME_LIMIT = 0;
export const FREE_EXPORT_LIMIT = 0;
export const FREE_LEARNING_DAY_LIMIT = 0;
export const RESUME_CREDIT_COST = 1;
export const EXPORT_CREDIT_COST = 1;
export const LEARNING_DAY_CREDIT_COST = 1;

function ensureUserAccounts() {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO user_accounts (user_id, credits)
       SELECT id, ? FROM users`
    )
    .run(DEFAULT_STARTING_CREDITS);
}

export function getUserAccount(userId: number) {
  ensureUserAccounts();
  const row = getDb().prepare("SELECT user_id, credits, plan, status, notes, updated_at FROM user_accounts WHERE user_id = ?").get(userId) as
    | { user_id: number; credits: number; plan: string; status: "active" | "suspended"; notes: string; updated_at: string }
    | undefined;

  return row
    ? {
        userId: row.user_id,
        credits: row.credits,
        plan: row.plan,
        status: row.status,
        notes: row.notes,
        updatedAt: row.updated_at
      }
    : { userId, credits: DEFAULT_STARTING_CREDITS, plan: "Free", status: "active" as const, notes: "", updatedAt: "" };
}

export function debitUserCredits(userId: number, amount = EXPORT_CREDIT_COST) {
  ensureUserAccounts();
  const cost = Math.max(1, Math.trunc(amount));
  const result = getDb()
    .prepare(
      `UPDATE user_accounts
       SET credits = credits - ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
         AND status = 'active'
         AND credits >= ?`
    )
    .run(cost, userId, cost);

  return result.changes > 0;
}

export function getUserUsage(userId: number) {
  const resumeCount = (getDb().prepare("SELECT COUNT(*) AS count FROM resumes WHERE user_id = ?").get(userId) as { count: number }).count;
  const exportCount = (getDb().prepare("SELECT COUNT(*) AS count FROM export_usage WHERE user_id = ?").get(userId) as { count: number }).count;
  const unlockedLearningDays = getUnlockedLearningDays(userId).length;

  return {
    resumeCount,
    exportCount,
    unlockedLearningDays,
    freeResumesRemaining: Math.max(0, FREE_RESUME_LIMIT - resumeCount),
    freeExportsRemaining: Math.max(0, FREE_EXPORT_LIMIT - exportCount),
    freeLearningDaysRemaining: Math.max(0, FREE_LEARNING_DAY_LIMIT - unlockedLearningDays)
  };
}

export function chargeForResumeCreation(userId: number) {
  ensureUserAccounts();
  const usage = getUserUsage(userId);
  if (usage.resumeCount < FREE_RESUME_LIMIT) return { allowed: true, charged: false, cost: 0 };

  const charged = debitUserCredits(userId, RESUME_CREDIT_COST);
  return { allowed: charged, charged, cost: charged ? RESUME_CREDIT_COST : 0 };
}

export function recordExportUsage(userId: number, resumeId: number, documentType: string, format: string) {
  ensureUserAccounts();
  const db = getDb();

  const transaction = db.transaction(() => {
    const used = (db.prepare("SELECT COUNT(*) AS count FROM export_usage WHERE user_id = ?").get(userId) as { count: number }).count;
    const cost = used < FREE_EXPORT_LIMIT ? 0 : EXPORT_CREDIT_COST;

    if (cost > 0) {
      const debit = db
        .prepare(
          `UPDATE user_accounts
           SET credits = credits - ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?
             AND status = 'active'
             AND credits >= ?`
        )
        .run(cost, userId, cost);

      if (!debit.changes) return { allowed: false, charged: false, cost };
    }

    db.prepare("INSERT INTO export_usage (user_id, resume_id, document_type, format, cost) VALUES (?, ?, ?, ?, ?)").run(userId, resumeId, documentType, format, cost);
    return { allowed: true, charged: cost > 0, cost };
  });

  return transaction() as { allowed: boolean; charged: boolean; cost: number };
}

export function getUnlockedLearningDays(userId: number) {
  const rows = getDb()
    .prepare(
      `SELECT day FROM learning_unlocks WHERE user_id = ?
       UNION
       SELECT day FROM learning_progress WHERE user_id = ?
       ORDER BY day`
    )
    .all(userId, userId) as Array<{ day: number }>;

  return rows.map((row) => row.day);
}

export function unlockLearningDay(userId: number, day: number, cost = LEARNING_DAY_CREDIT_COST) {
  ensureUserAccounts();
  const db = getDb();
  const normalizedCost = Math.max(1, Math.trunc(cost));

  const transaction = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT day FROM learning_unlocks WHERE user_id = ? AND day = ?
         UNION
         SELECT day FROM learning_progress WHERE user_id = ? AND day = ?`
      )
      .get(userId, day, userId, day);

    if (existing) return { unlocked: true, charged: false };

    const unlockedCount = (
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM (
             SELECT day FROM learning_unlocks WHERE user_id = ?
             UNION
             SELECT day FROM learning_progress WHERE user_id = ?
           )`
        )
        .get(userId, userId) as { count: number }
    ).count;
    const actualCost = unlockedCount < FREE_LEARNING_DAY_LIMIT ? 0 : normalizedCost;

    if (actualCost > 0) {
      const debit = db
        .prepare(
          `UPDATE user_accounts
           SET credits = credits - ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?
             AND status = 'active'
             AND credits >= ?`
        )
        .run(actualCost, userId, actualCost);

      if (!debit.changes) return { unlocked: false, charged: false, cost: actualCost };
    }

    db.prepare("INSERT INTO learning_unlocks (user_id, day, cost) VALUES (?, ?, ?)").run(userId, day, actualCost);
    return { unlocked: true, charged: actualCost > 0, cost: actualCost };
  });

  return transaction() as { unlocked: boolean; charged: boolean; cost?: number };
}

export function listAdminUsers(): AdminUserAccount[] {
  ensureUserAccounts();
  const rows = getDb()
    .prepare(
      `SELECT
         users.id,
         users.name,
         users.email,
         users.created_at,
         user_accounts.credits,
         user_accounts.plan,
         user_accounts.status,
         user_accounts.notes,
         user_accounts.updated_at,
         COALESCE(resume_counts.resume_count, 0) AS resume_count,
         COALESCE(export_counts.export_count, 0) AS export_count,
         COALESCE(progress_counts.completed_lessons, 0) AS completed_lessons,
         COALESCE(unlock_counts.unlocked_lessons, 0) AS unlocked_lessons
       FROM users
       JOIN user_accounts ON user_accounts.user_id = users.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS resume_count
         FROM resumes
         GROUP BY user_id
       ) resume_counts ON resume_counts.user_id = users.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS export_count
         FROM export_usage
         GROUP BY user_id
       ) export_counts ON export_counts.user_id = users.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS completed_lessons
         FROM learning_progress
         WHERE completed = 1
         GROUP BY user_id
       ) progress_counts ON progress_counts.user_id = users.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS unlocked_lessons
         FROM (
           SELECT user_id, day FROM learning_unlocks
           UNION
           SELECT user_id, day FROM learning_progress
         )
         GROUP BY user_id
       ) unlock_counts ON unlock_counts.user_id = users.id
       ORDER BY users.created_at DESC`
    )
    .all() as Array<{
    id: number;
    name: string;
    email: string;
    created_at: string;
    credits: number;
    plan: string;
    status: "active" | "suspended";
    notes: string;
    updated_at: string;
    resume_count: number;
    export_count: number;
    completed_lessons: number;
    unlocked_lessons: number;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    credits: row.credits,
    plan: row.plan,
    status: row.status,
    notes: row.notes,
    updatedAt: row.updated_at,
    resumeCount: row.resume_count,
    exportCount: row.export_count,
    completedLessons: row.completed_lessons,
    unlockedLessons: row.unlocked_lessons
  }));
}

export function updateUserAccount(userId: number, input: { credits: number; plan: string; status: string; notes: string }) {
  const status = validStatuses.has(input.status) ? input.status : "active";
  const credits = Number.isFinite(input.credits) ? Math.max(0, Math.trunc(input.credits)) : 0;

  const result = getDb()
    .prepare(
      `INSERT INTO user_accounts (user_id, credits, plan, status, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         credits = excluded.credits,
         plan = excluded.plan,
         status = excluded.status,
         notes = excluded.notes,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(userId, credits, input.plan.trim() || "Free", status, input.notes.trim());

  return result.changes > 0;
}

export function createCreditRequest(userId: number, amount: number, message: string) {
  const normalizedAmount = Math.max(1, Math.min(1000, Math.trunc(amount)));
  const result = getDb()
    .prepare("INSERT INTO credit_requests (user_id, amount, message) VALUES (?, ?, ?)")
    .run(userId, normalizedAmount, message.trim());

  return Number(result.lastInsertRowid);
}

export function listCreditRequests(status: "pending" | "all" = "pending"): CreditRequestRecord[] {
  const rows = getDb()
    .prepare(
      `SELECT
         credit_requests.id,
         credit_requests.user_id,
         users.name AS user_name,
         users.email AS user_email,
         credit_requests.amount,
         credit_requests.message,
         credit_requests.status,
         credit_requests.admin_note,
         credit_requests.created_at,
         credit_requests.updated_at
       FROM credit_requests
       JOIN users ON users.id = credit_requests.user_id
       WHERE (? = 'all' OR credit_requests.status = ?)
       ORDER BY credit_requests.created_at DESC`
    )
    .all(status, status) as Array<{
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    amount: number;
    message: string;
    status: "pending" | "approved" | "rejected";
    admin_note: string;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    amount: row.amount,
    message: row.message,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function reviewCreditRequest(requestId: number, approve: boolean, adminNote: string) {
  const db = getDb();

  const transaction = db.transaction(() => {
    const request = db.prepare("SELECT id, user_id, amount, status FROM credit_requests WHERE id = ?").get(requestId) as
      | { id: number; user_id: number; amount: number; status: string }
      | undefined;

    if (!request || request.status !== "pending") return false;

    const status = approve ? "approved" : "rejected";
    db.prepare("UPDATE credit_requests SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, adminNote.trim(), requestId);

    if (approve) {
      ensureUserAccounts();
      db.prepare(
        `UPDATE user_accounts
         SET credits = credits + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`
      ).run(request.amount, request.user_id);
    }

    return true;
  });

  return transaction() as boolean;
}
