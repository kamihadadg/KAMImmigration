import { z } from "zod";

export const resumeProjectEntrySchema = z.object({
  name: z.string().min(1),
  url: z.string().optional().default(""),
  role: z.string().optional().default(""),
  technologies: z.array(z.string()).default([]),
  description: z.string().optional().default(""),
  bullets: z.array(z.string()).default([])
});

export const resumeEducationEntrySchema = z.object({
  degree: z.string().min(1),
  field: z.string().optional().default(""),
  school: z.string().min(1),
  location: z.string().optional().default(""),
  start: z.string().optional().default(""),
  end: z.string().optional().default(""),
  gpa: z.string().optional().default(""),
  honors: z.array(z.string()).default([]),
  year: z.string().optional().default("")
});

export const resumeProfileSchema = z.object({
  personal: z.object({
    fullName: z.string().min(1),
    headline: z.string().min(1),
    location: z.string().min(1),
    address: z.string().optional().default(""),
    nationality: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().email(),
    linkedin: z.string().optional().default(""),
    github: z.string().optional().default(""),
    website: z.string().optional().default("")
  }),
  target: z.object({
    country: z.string().min(1),
    relocationLine: z.string().min(1),
    permitLine: z.string().min(1),
    availability: z.string().optional().default(""),
    preferredLocations: z.array(z.string()).default([]),
    targetRoles: z.array(z.string()).default([])
  }),
  summary: z.array(z.string()).default([]),
  skills: z.record(z.string(), z.array(z.string())).default({}),
  experience: z.array(
    z.object({
      company: z.string().min(1),
      location: z.string().optional().default(""),
      title: z.string().min(1),
      employmentType: z.string().optional().default(""),
      start: z.string().optional().default(""),
      end: z.string().optional().default(""),
      technologies: z.array(z.string()).default([]),
      bullets: z.array(z.string()).default([])
    })
  ).default([]),
  projects: z.array(resumeProjectEntrySchema).default([]),
  education: z.array(resumeEducationEntrySchema).default([]),
  certifications: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  publications: z.array(z.string()).default([]),
  patents: z.array(z.string()).default([]),
  volunteer: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  coverLetter: z.object({
    greeting: z.string().default("Dear Hiring Manager,"),
    opening: z.string().default("I am writing to express my interest in software architecture and technical leadership opportunities."),
    closing: z.string().default("Thank you for your time and consideration.")
  })
});

export type ResumeProfile = z.infer<typeof resumeProfileSchema>;

export const academicProfileSchema = z.object({
  personal: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().default(""),
    location: z.string().min(1),
    address: z.string().optional().default(""),
    nationality: z.string().optional().default(""),
    linkedin: z.string().optional().default(""),
    website: z.string().optional().default(""),
    orcid: z.string().optional().default("")
  }),
  application: z.object({
    program: z.string().optional().default(""),
    institution: z.string().optional().default(""),
    intakeTerm: z.string().optional().default("")
  }),
  researchInterests: z.array(z.string()).default([]),
  education: z.array(resumeEducationEntrySchema).default([]),
  teaching: z
    .array(
      z.object({
        institution: z.string().min(1),
        course: z.string().optional().default(""),
        role: z.string().optional().default(""),
        period: z.string().optional().default(""),
        bullets: z.array(z.string()).default([])
      })
    )
    .default([]),
  researchExperience: z
    .array(
      z.object({
        labOrGroup: z.string().optional().default(""),
        institution: z.string().min(1),
        title: z.string().optional().default(""),
        period: z.string().optional().default(""),
        bullets: z.array(z.string()).default([])
      })
    )
    .default([]),
  publications: z
    .array(
      z.object({
        citation: z.string().min(1),
        doi: z.string().optional().default(""),
        venue: z.string().optional().default(""),
        year: z.string().optional().default("")
      })
    )
    .default([]),
  presentations: z
    .array(
      z.object({
        title: z.string().min(1),
        venue: z.string().optional().default(""),
        date: z.string().optional().default(""),
        kind: z.string().optional().default("")
      })
    )
    .default([]),
  projects: z.array(resumeProjectEntrySchema).default([]),
  honors: z.array(z.string()).default([]),
  grants: z.array(z.string()).default([]),
  service: z.array(z.string()).default([]),
  skills: z.record(z.string(), z.array(z.string())).default({}),
  languages: z.array(z.string()).default([]),
  standardizedTests: z
    .array(
      z.object({
        name: z.string().min(1),
        score: z.string().optional().default(""),
        date: z.string().optional().default("")
      })
    )
    .default([]),
  references: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().optional().default(""),
        affiliation: z.string().optional().default(""),
        email: z.string().optional().default(""),
        phone: z.string().optional().default("")
      })
    )
    .default([])
});

export type AcademicProfile = z.infer<typeof academicProfileSchema>;

export type ResumeKind = "job" | "academic";

type ResumeRecordBase = {
  id: number;
  userId: number;
  title: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type JobResumeRecord = ResumeRecordBase & {
  kind: "job";
  profile: ResumeProfile;
};

export type AcademicResumeRecord = ResumeRecordBase & {
  kind: "academic";
  profile: AcademicProfile;
};

export type ResumeRecord = JobResumeRecord | AcademicResumeRecord;

export type UserRecord = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};
