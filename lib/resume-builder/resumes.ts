import "server-only";

import { getDb, mapResume } from "./db";
import { sampleAcademicProfile } from "./sample-academic-profile";
import { sampleResumeProfile } from "./sample-profile";
import {
  academicProfileSchema,
  resumeProfileSchema,
  type AcademicProfile,
  type ResumeProfile,
  type ResumeRecord
} from "./schema";

export function listResumes(userId: number): ResumeRecord[] {
  return getDb()
    .prepare("SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId)
    .map(mapResume);
}

export function getResume(userId: number, resumeId: number): ResumeRecord | null {
  const row = getDb().prepare("SELECT * FROM resumes WHERE id = ? AND user_id = ?").get(resumeId, userId);
  return row ? mapResume(row) : null;
}

export function createResume(userId: number, title = "My Migration Resume", country = sampleResumeProfile.target.country): number {
  const profile = { ...sampleResumeProfile, target: { ...sampleResumeProfile.target, country } };
  const result = getDb()
    .prepare("INSERT INTO resumes (user_id, title, country, profile_json, kind) VALUES (?, ?, ?, ?, 'job')")
    .run(userId, title, country, JSON.stringify(profile));
  return Number(result.lastInsertRowid);
}

export function createAcademicResume(userId: number, title = "Academic CV", country = "Remote"): number {
  const profile = { ...sampleAcademicProfile };
  const result = getDb()
    .prepare("INSERT INTO resumes (user_id, title, country, profile_json, kind) VALUES (?, ?, ?, ?, 'academic')")
    .run(userId, title, country, JSON.stringify(profile));
  return Number(result.lastInsertRowid);
}

export function updateResume(userId: number, resumeId: number, title: string, country: string, profile: ResumeProfile) {
  const parsed = resumeProfileSchema.parse(profile);
  const result = getDb()
    .prepare(
      "UPDATE resumes SET title = ?, country = ?, profile_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND kind = 'job'"
    )
    .run(title.trim() || "Untitled Resume", country.trim() || parsed.target.country, JSON.stringify(parsed), resumeId, userId);
  return result.changes > 0;
}

export function updateAcademicResume(userId: number, resumeId: number, title: string, country: string, profile: AcademicProfile) {
  const parsed = academicProfileSchema.parse(profile);
  const result = getDb()
    .prepare(
      "UPDATE resumes SET title = ?, country = ?, profile_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND kind = 'academic'"
    )
    .run(title.trim() || "Untitled Academic CV", country.trim() || "Remote", JSON.stringify(parsed), resumeId, userId);
  return result.changes > 0;
}

export function duplicateResume(userId: number, resumeId: number): number | null {
  const resume = getResume(userId, resumeId);
  if (!resume) return null;

  const result = getDb()
    .prepare("INSERT INTO resumes (user_id, title, country, profile_json, kind) VALUES (?, ?, ?, ?, ?)")
    .run(userId, `${resume.title} - Copy`, resume.country, JSON.stringify(resume.profile), resume.kind);

  return Number(result.lastInsertRowid);
}

export function deleteResume(userId: number, resumeId: number) {
  const result = getDb().prepare("DELETE FROM resumes WHERE id = ? AND user_id = ?").run(resumeId, userId);
  return result.changes > 0;
}
