"use server";

import { redirect } from "next/navigation";
import { changeUserPassword, clearSession, loginUser, registerUser, requireUser, resetUserPassword, updateUserProfile } from "@/lib/resume-builder/auth";
import { requireAdmin } from "@/lib/resume-builder/auth";
import { chargeForResumeCreation, createCreditRequest, reviewCreditRequest, updateUserAccount } from "@/lib/resume-builder/admin";
import { updateOptionSet } from "@/lib/resume-builder/options";
import {
  createAcademicResume,
  createResume,
  deleteResume,
  duplicateResume,
  getResume,
  updateAcademicResume,
  updateResume
} from "@/lib/resume-builder/resumes";
import { academicProfileSchema, resumeProfileSchema } from "@/lib/resume-builder/schema";
import { textToTargets, updateResumeTargetList, updateUniversityTargetList } from "@/lib/resume-builder/targets";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function lines(formData: FormData, name: string) {
  return value(formData, name)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function csv(formData: FormData, name: string) {
  return value(formData, name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formCount(formData: FormData, name: string, fallback: number) {
  const parsed = Number(value(formData, name));
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function dynamicSkills(formData: FormData) {
  const count = formCount(formData, "skillsCount", 0);
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const name = value(formData, `skills.${index}.name`);
      const values = csv(formData, `skills.${index}.values`);
      return name && values.length ? [name, values] : null;
    }).filter((item): item is [string, string[]] => Boolean(item))
  );
}

export async function registerAction(formData: FormData) {
  const name = value(formData, "name");
  const email = value(formData, "email");
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");
  const website = value(formData, "website");
  const challenge = value(formData, "challenge");
  const issuedAt = Number(value(formData, "issuedAt"));
  const tooFast = Number.isFinite(issuedAt) && Date.now() - issuedAt < 1500;

  if (website || challenge !== "12" || tooFast) {
    redirect("/register?error=bot-check");
  }

  if (!name || !email || password.length < 8 || password !== confirmPassword) {
    redirect("/register?error=invalid");
  }
  try {
    await registerUser(name, email, password);
  } catch {
    redirect("/register?error=exists");
  }
  redirect("/dashboard");
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const currentPassword = value(formData, "currentPassword");
  const newPassword = value(formData, "newPassword");
  const confirmPassword = value(formData, "confirmPassword");

  if (newPassword.length < 8 || newPassword !== confirmPassword) {
    redirect("/resume-builder/account/security?error=invalid");
  }

  const changed = await changeUserPassword(user.id, currentPassword, newPassword);
  if (!changed) {
    redirect("/resume-builder/account/security?error=current");
  }

  redirect("/resume-builder/account/security?saved=1");
}

export async function loginAction(formData: FormData) {
  const email = value(formData, "email");
  const password = value(formData, "password");
  const success = await loginUser(email, password);
  if (!success) {
    redirect("/login?error=invalid");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = value(formData, "name");
  const email = value(formData, "email");
  const outcome = updateUserProfile(user.id, name, email);
  if (outcome === "invalid") redirect("/profile?error=invalid");
  if (outcome === "email_taken") redirect("/profile?error=email");
  redirect("/profile?saved=1");
}

export async function requestCreditIncreaseAction(formData: FormData) {
  const user = await requireUser();
  const amount = Number(value(formData, "amount"));
  const message = value(formData, "message");

  if (!Number.isFinite(amount) || amount < 1) {
    redirect("/dashboard/work?error=invalid-credit-request");
  }

  createCreditRequest(user.id, amount, message);
  redirect("/dashboard/work?credit-requested=1");
}

export async function saveOptionSetAction(formData: FormData) {
  await requireAdmin();
  const key = value(formData, "key");
  const values = lines(formData, "values");

  try {
    updateOptionSet(key, values);
  } catch {
    redirect("/resume-builder/admin/options?error=invalid");
  }

  redirect("/resume-builder/admin/options?saved=1");
}

export async function saveResumeTargetsAction(formData: FormData) {
  await requireAdmin();
  const country = value(formData, "country");
  const targets = textToTargets(value(formData, "targets"));

  try {
    updateResumeTargetList(country, targets);
  } catch {
    redirect("/admin/targets?kind=work&error=invalid");
  }

  redirect(`/admin/targets?kind=work&country=${encodeURIComponent(country)}&saved=1`);
}

export async function saveUniversityTargetsAction(formData: FormData) {
  await requireAdmin();
  const country = value(formData, "country");
  const field = value(formData, "field");
  const targets = textToTargets(value(formData, "targets"));

  try {
    updateUniversityTargetList(country, field, targets);
  } catch {
    redirect(
      `/admin/targets?kind=universities&country=${encodeURIComponent(country)}&field=${encodeURIComponent(field)}&error=invalid`
    );
  }

  redirect(
    `/admin/targets?kind=universities&country=${encodeURIComponent(country)}&field=${encodeURIComponent(field)}&saved=1`
  );
}

export async function updateUserAccountAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(value(formData, "userId"));
  const credits = Number(value(formData, "credits"));
  const status = value(formData, "status");

  if (!Number.isInteger(userId)) {
    redirect("/resume-builder/admin?error=invalid-user");
  }

  updateUserAccount(userId, {
    credits,
    plan: value(formData, "plan"),
    status: userId === admin.id ? "active" : status,
    notes: value(formData, "notes")
  });

  redirect("/resume-builder/admin?saved=1");
}

export async function resetUserPasswordAction(formData: FormData) {
  await requireAdmin();
  const userId = Number(value(formData, "userId"));
  const newPassword = value(formData, "newPassword");
  const confirmPassword = value(formData, "confirmPassword");

  if (!Number.isInteger(userId) || newPassword.length < 8 || newPassword !== confirmPassword) {
    redirect("/resume-builder/admin?error=password");
  }

  const changed = await resetUserPassword(userId, newPassword);
  redirect(changed ? "/resume-builder/admin?password=reset" : "/resume-builder/admin?error=invalid-user");
}

export async function reviewCreditRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = Number(value(formData, "requestId"));
  const decision = value(formData, "decision");
  const adminNote = value(formData, "adminNote");

  if (!Number.isInteger(requestId) || !["approve", "reject"].includes(decision)) {
    redirect("/resume-builder/admin?error=credit-request");
  }

  const reviewed = reviewCreditRequest(requestId, decision === "approve", adminNote);
  redirect(reviewed ? "/resume-builder/admin?credit-reviewed=1" : "/resume-builder/admin?error=credit-request");
}

export async function createResumeAction(formData: FormData) {
  const user = await requireUser();
  const title = value(formData, "title") || "My Migration Resume";
  const country = value(formData, "country") || "Netherlands";
  const charge = chargeForResumeCreation(user.id);
  if (!charge.allowed) {
    redirect("/dashboard/work?error=no-credits-resume");
  }
  const id = createResume(user.id, title, country);
  redirect(`/resume-builder/editor/${id}`);
}

export async function createAcademicResumeAction(formData: FormData) {
  const user = await requireUser();
  const title = value(formData, "title") || "Academic CV";
  const country = value(formData, "country") || "Remote";
  const charge = chargeForResumeCreation(user.id);
  if (!charge.allowed) {
    redirect("/dashboard/study?error=no-credits-resume");
  }
  const id = createAcademicResume(user.id, title, country);
  redirect(`/resume-builder/academic-editor/${id}`);
}

export async function duplicateResumeAction(formData: FormData) {
  const user = await requireUser();
  const resumeId = Number(value(formData, "resumeId"));
  if (!Number.isInteger(resumeId)) {
    redirect("/dashboard?error=resume-not-found");
  }
  const source = getResume(user.id, resumeId);
  if (!source) {
    redirect("/dashboard?error=resume-not-found");
  }
  const back = source.kind === "academic" ? "/dashboard/study" : "/dashboard/work";
  const charge = chargeForResumeCreation(user.id);
  if (!charge.allowed) {
    redirect(`${back}?error=no-credits-resume`);
  }
  const id = duplicateResume(user.id, resumeId);
  if (!id) {
    redirect(`${back}?error=resume-not-found`);
  }
  const copy = getResume(user.id, id);
  const path = copy?.kind === "academic" ? `/resume-builder/academic-editor/${id}?saved=1` : `/resume-builder/editor/${id}?saved=1`;
  redirect(path);
}

export async function deleteResumeAction(formData: FormData) {
  const user = await requireUser();
  const resumeId = Number(value(formData, "resumeId"));
  let redirectTo = "/dashboard/work?deleted=1";
  if (Number.isInteger(resumeId)) {
    const existing = getResume(user.id, resumeId);
    if (existing?.kind === "academic") {
      redirectTo = "/dashboard/study?deleted=1";
    }
    deleteResume(user.id, resumeId);
  }
  redirect(redirectTo);
}

export async function saveResumeAction(formData: FormData) {
  const user = await requireUser();
  const resumeId = Number(value(formData, "resumeId"));
  const title = value(formData, "title") || "Untitled Resume";
  const country = value(formData, "country") || "Netherlands";
  const rawProfile = value(formData, "profileJson");

  const existing = getResume(user.id, resumeId);
  if (!existing || existing.kind !== "job") {
    redirect("/dashboard/work?error=resume-not-found");
  }

  try {
    const profile = rawProfile
      ? resumeProfileSchema.parse(JSON.parse(rawProfile))
      : resumeProfileSchema.parse({
          personal: {
            fullName: value(formData, "personal.fullName"),
            headline: value(formData, "personal.headline"),
            location: value(formData, "personal.location"),
            address: value(formData, "personal.address"),
            nationality: value(formData, "personal.nationality"),
            phone: value(formData, "personal.phone"),
            email: value(formData, "personal.email"),
            linkedin: value(formData, "personal.linkedin"),
            github: value(formData, "personal.github"),
            website: value(formData, "personal.website")
          },
          target: {
            country,
            relocationLine: value(formData, "target.relocationLine"),
            permitLine: value(formData, "target.permitLine"),
            availability: value(formData, "target.availability"),
            preferredLocations: csv(formData, "target.preferredLocations"),
            targetRoles: csv(formData, "target.targetRoles")
          },
          summary: lines(formData, "summary"),
          skills: dynamicSkills(formData),
          experience: Array.from({ length: formCount(formData, "experienceCount", 0) }, (_, index) => index)
            .map((index) => ({
              company: value(formData, `experience.${index}.company`),
              location: value(formData, `experience.${index}.location`),
              title: value(formData, `experience.${index}.title`),
              employmentType: value(formData, `experience.${index}.employmentType`),
              start: value(formData, `experience.${index}.start`),
              end: value(formData, `experience.${index}.end`),
              technologies: csv(formData, `experience.${index}.technologies`),
              bullets: lines(formData, `experience.${index}.bullets`)
            }))
            .filter((item) => item.company && item.title),
          projects: Array.from({ length: formCount(formData, "projectsCount", 0) }, (_, index) => index)
            .map((index) => ({
              name: value(formData, `projects.${index}.name`),
              url: value(formData, `projects.${index}.url`),
              role: value(formData, `projects.${index}.role`),
              technologies: csv(formData, `projects.${index}.technologies`),
              description: value(formData, `projects.${index}.description`),
              bullets: lines(formData, `projects.${index}.bullets`)
            }))
            .filter((item) => item.name),
          education: Array.from({ length: formCount(formData, "educationCount", 0) }, (_, index) => index)
            .map((index) => ({
              degree: value(formData, `education.${index}.degree`),
              field: value(formData, `education.${index}.field`),
              school: value(formData, `education.${index}.school`),
              location: value(formData, `education.${index}.location`),
              start: value(formData, `education.${index}.start`),
              end: value(formData, `education.${index}.end`),
              gpa: value(formData, `education.${index}.gpa`),
              honors: lines(formData, `education.${index}.honors`),
              year: value(formData, `education.${index}.year`)
            }))
            .filter((item) => item.degree && item.school),
          certifications: lines(formData, "certifications"),
          awards: lines(formData, "awards"),
          publications: lines(formData, "publications"),
          patents: lines(formData, "patents"),
          volunteer: lines(formData, "volunteer"),
          languages: lines(formData, "languages"),
          coverLetter: {
            greeting: value(formData, "coverLetter.greeting"),
            opening: value(formData, "coverLetter.opening"),
            closing: value(formData, "coverLetter.closing")
          }
        });
    updateResume(user.id, resumeId, title, country, profile);
  } catch {
    redirect(`/resume-builder/editor/${resumeId}?error=invalid-form`);
  }

  redirect(`/resume-builder/editor/${resumeId}?saved=1`);
}

export async function saveAcademicResumeAction(formData: FormData) {
  const user = await requireUser();
  const resumeId = Number(value(formData, "resumeId"));
  const title = value(formData, "title") || "Untitled Academic CV";
  const country = value(formData, "country") || "Remote";

  const existing = getResume(user.id, resumeId);
  if (!existing || existing.kind !== "academic") {
    redirect("/dashboard/study?error=resume-not-found");
  }

  try {
    const profile = academicProfileSchema.parse({
      personal: {
        fullName: value(formData, "personal.fullName"),
        email: value(formData, "personal.email"),
        phone: value(formData, "personal.phone"),
        location: value(formData, "personal.location"),
        address: value(formData, "personal.address"),
        nationality: value(formData, "personal.nationality"),
        linkedin: value(formData, "personal.linkedin"),
        website: value(formData, "personal.website"),
        orcid: value(formData, "personal.orcid")
      },
      application: {
        program: value(formData, "application.program"),
        institution: value(formData, "application.institution"),
        intakeTerm: value(formData, "application.intakeTerm")
      },
      researchInterests: lines(formData, "researchInterests"),
      education: Array.from({ length: formCount(formData, "educationCount", 0) }, (_, index) => index)
        .map((index) => ({
          degree: value(formData, `education.${index}.degree`),
          field: value(formData, `education.${index}.field`),
          school: value(formData, `education.${index}.school`),
          location: value(formData, `education.${index}.location`),
          start: value(formData, `education.${index}.start`),
          end: value(formData, `education.${index}.end`),
          gpa: value(formData, `education.${index}.gpa`),
          honors: lines(formData, `education.${index}.honors`),
          year: value(formData, `education.${index}.year`)
        }))
        .filter((item) => item.degree && item.school),
      teaching: Array.from({ length: formCount(formData, "teachingCount", 0) }, (_, index) => index)
        .map((index) => ({
          institution: value(formData, `teaching.${index}.institution`),
          course: value(formData, `teaching.${index}.course`),
          role: value(formData, `teaching.${index}.role`),
          period: value(formData, `teaching.${index}.period`),
          bullets: lines(formData, `teaching.${index}.bullets`)
        }))
        .filter((item) => item.institution),
      researchExperience: Array.from({ length: formCount(formData, "researchExperienceCount", 0) }, (_, index) => index)
        .map((index) => ({
          labOrGroup: value(formData, `researchExperience.${index}.labOrGroup`),
          institution: value(formData, `researchExperience.${index}.institution`),
          title: value(formData, `researchExperience.${index}.title`),
          period: value(formData, `researchExperience.${index}.period`),
          bullets: lines(formData, `researchExperience.${index}.bullets`)
        }))
        .filter((item) => item.institution),
      publications: Array.from({ length: formCount(formData, "publicationsCount", 0) }, (_, index) => index)
        .map((index) => ({
          citation: value(formData, `publications.${index}.citation`),
          doi: value(formData, `publications.${index}.doi`),
          venue: value(formData, `publications.${index}.venue`),
          year: value(formData, `publications.${index}.year`)
        }))
        .filter((item) => item.citation),
      presentations: Array.from({ length: formCount(formData, "presentationsCount", 0) }, (_, index) => index)
        .map((index) => ({
          title: value(formData, `presentations.${index}.title`),
          venue: value(formData, `presentations.${index}.venue`),
          date: value(formData, `presentations.${index}.date`),
          kind: value(formData, `presentations.${index}.kind`)
        }))
        .filter((item) => item.title),
      projects: Array.from({ length: formCount(formData, "projectsCount", 0) }, (_, index) => index)
        .map((index) => ({
          name: value(formData, `projects.${index}.name`),
          url: value(formData, `projects.${index}.url`),
          role: value(formData, `projects.${index}.role`),
          technologies: csv(formData, `projects.${index}.technologies`),
          description: value(formData, `projects.${index}.description`),
          bullets: lines(formData, `projects.${index}.bullets`)
        }))
        .filter((item) => item.name),
      honors: lines(formData, "honors"),
      grants: lines(formData, "grants"),
      service: lines(formData, "service"),
      skills: dynamicSkills(formData),
      languages: lines(formData, "languages"),
      standardizedTests: Array.from({ length: formCount(formData, "standardizedTestsCount", 0) }, (_, index) => index)
        .map((index) => ({
          name: value(formData, `standardizedTests.${index}.name`),
          score: value(formData, `standardizedTests.${index}.score`),
          date: value(formData, `standardizedTests.${index}.date`)
        }))
        .filter((item) => item.name),
      references: Array.from({ length: formCount(formData, "referencesCount", 0) }, (_, index) => index)
        .map((index) => ({
          name: value(formData, `references.${index}.name`),
          title: value(formData, `references.${index}.title`),
          affiliation: value(formData, `references.${index}.affiliation`),
          email: value(formData, `references.${index}.email`),
          phone: value(formData, `references.${index}.phone`)
        }))
        .filter((item) => item.name)
    });
    const ok = updateAcademicResume(user.id, resumeId, title, country, profile);
    if (!ok) {
      redirect(`/resume-builder/academic-editor/${resumeId}?error=invalid-form`);
    }
  } catch {
    redirect(`/resume-builder/academic-editor/${resumeId}?error=invalid-form`);
  }

  redirect(`/resume-builder/academic-editor/${resumeId}?saved=1`);
}
