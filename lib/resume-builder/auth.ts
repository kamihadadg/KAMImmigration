import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { DEFAULT_STARTING_CREDITS } from "./admin";
import { getDb, mapUser } from "./db";
import { ensureUserSettingsRow } from "./user-ai-settings";
import type { UserRecord } from "./schema";

const cookieName = "kam_resume_session";
const fallbackSecret = "local-dev-resume-builder-secret";

function sessionSecret() {
  return process.env.RESUME_BUILDER_SECRET || process.env.NEXTAUTH_SECRET || fallbackSecret;
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function encodeSession(userId: number) {
  const payload = JSON.stringify({ userId, issuedAt: Date.now() });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(value?: string) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { userId?: number };
    return typeof parsed.userId === "number" ? parsed.userId : null;
  } catch {
    return null;
  }
}

export async function setSession(userId: number) {
  const store = await cookies();
  store.set(cookieName, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const store = await cookies();
  const userId = decodeSession(store.get(cookieName)?.value);
  if (!userId) return null;
  const account = getDb().prepare("SELECT status FROM user_accounts WHERE user_id = ?").get(userId) as { status?: string } | undefined;
  if (account?.status === "suspended") return null;
  const row = getDb().prepare("SELECT id, email, name, created_at FROM users WHERE id = ?").get(userId);
  return row ? mapUser(row) : null;
}

export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

export function isAdminUser(user: UserRecord) {
  const adminEmails = (process.env.RESUME_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length) {
    return adminEmails.includes(user.email.toLowerCase());
  }

  const firstUser = getDb().prepare("SELECT MIN(id) AS id FROM users").get() as { id?: number };
  return user.id === firstUser.id;
}

export async function requireAdmin(): Promise<UserRecord> {
  const user = await requireUser();
  if (!isAdminUser(user)) {
    throw new Error("Admin access required.");
  }
  return user;
}

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = getDb()
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(normalizedEmail, passwordHash, name.trim());
  const userId = Number(result.lastInsertRowid);
  getDb()
    .prepare("INSERT OR IGNORE INTO user_accounts (user_id, credits) VALUES (?, ?)")
    .run(userId, DEFAULT_STARTING_CREDITS);
  ensureUserSettingsRow(userId);
  await setSession(userId);
}

export async function loginUser(email: string, password: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!row) return false;
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) return false;
  const account = getDb().prepare("SELECT status FROM user_accounts WHERE user_id = ?").get(row.id) as { status?: string } | undefined;
  if (account?.status === "suspended") return false;
  await setSession(row.id);
  return true;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function updateUserProfile(userId: number, name: string, email: string): "ok" | "invalid" | "email_taken" {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!trimmedName || !normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return "invalid";
  }

  const taken = getDb().prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(normalizedEmail, userId) as { id?: number } | undefined;
  if (taken) return "email_taken";

  const result = getDb().prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(trimmedName, normalizedEmail, userId);
  return result.changes > 0 ? "ok" : "invalid";
}

export async function changeUserPassword(userId: number, currentPassword: string, newPassword: string) {
  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as { password_hash?: string } | undefined;
  if (!row?.password_hash) return false;

  const valid = await bcrypt.compare(currentPassword, row.password_hash);
  if (!valid) return false;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const result = getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId);
  return result.changes > 0;
}

export async function resetUserPassword(userId: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const result = getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId);
  return result.changes > 0;
}
