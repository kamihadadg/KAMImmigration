import "server-only";

import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import type { AcademicProfile, ResumeProfile } from "./schema";

export type DocumentType = "cv" | "cover-letter" | "email" | "academic-cv";
export type ExportFormat = "md" | "docx" | "pdf";

function lineBreak(lines: string[]) {
  return lines.join("\n");
}

function bulletLines(items: string[]) {
  return items.map((item) => `- ${item}`);
}

function compact(items: Array<string | undefined>) {
  return items.map((item) => item?.trim()).filter((item): item is string => Boolean(item));
}

function pushOptionalSection(lines: string[], title: string, items: string[] | undefined) {
  const cleanItems = compact(items ?? []);
  if (!cleanItems.length) return;
  lines.push(`## ${title}`, "", ...bulletLines(cleanItems), "");
}

export function renderMarkdown(profile: ResumeProfile, type: DocumentType) {
  if (type === "cover-letter") return renderCoverLetterMarkdown(profile);
  if (type === "email") return renderEmailMarkdown(profile);
  if (type === "academic-cv") {
    throw new Error("academic-cv export uses renderAcademicCvMarkdown with an AcademicProfile");
  }
  return renderCvMarkdown(profile);
}

export function renderAcademicCvMarkdown(profile: AcademicProfile) {
  const lines: string[] = [
    `# ${profile.personal.fullName}`,
    "",
    ...compact([
      profile.personal.location,
      profile.personal.email ? `Email: ${profile.personal.email}` : undefined,
      profile.personal.phone ? `Phone: ${profile.personal.phone}` : undefined,
      profile.personal.address || undefined,
      profile.personal.nationality ? `Nationality: ${profile.personal.nationality}` : undefined,
      profile.personal.linkedin || undefined,
      profile.personal.website || undefined,
      profile.personal.orcid ? `ORCID: ${profile.personal.orcid}` : undefined
    ]).map((item) => `${item}  `),
    ""
  ];

  const appBits = compact([profile.application.program, profile.application.institution, profile.application.intakeTerm]);
  if (appBits.length) {
    lines.push("## Application focus", "", appBits.join(" · "), "");
  }

  if (profile.researchInterests.length) {
    lines.push("## Research interests", "", ...bulletLines(profile.researchInterests), "");
  }

  if (profile.education.length) {
    lines.push("## Education", "");
    profile.education.forEach((item) => {
      const degree = compact([item.degree, item.field]).join(" — ");
      const dates = compact([item.start, item.end || item.year]).join(" – ");
      const schoolLine = compact([item.school, item.location, dates]).join(" | ");
      lines.push(`**${degree}**  `, `${schoolLine}  `);
      if (item.gpa) lines.push(`GPA / grade: ${item.gpa}  `);
      if (item.honors?.length) lines.push(...bulletLines(item.honors));
      lines.push("");
    });
  }

  if (profile.teaching.length) {
    lines.push("## Teaching experience", "");
    profile.teaching.forEach((t) => {
      lines.push(`### ${t.institution}`, compact([t.role, t.course, t.period]).filter(Boolean).join(" · "), "", ...bulletLines(t.bullets), "");
    });
  }

  if (profile.researchExperience.length) {
    lines.push("## Research experience", "");
    profile.researchExperience.forEach((r) => {
      const head = compact([r.labOrGroup, r.institution]).join(" — ");
      lines.push(`### ${head}`, compact([r.title, r.period]).filter(Boolean).join(" · "), "", ...bulletLines(r.bullets), "");
    });
  }

  if (profile.publications.length) {
    lines.push("## Publications", "");
    profile.publications.forEach((p) => {
      const meta = compact([p.venue, p.year, p.doi ? `DOI: ${p.doi}` : undefined]).filter(Boolean).join(" · ");
      lines.push(`- ${p.citation}${meta ? `  \n  *${meta}*` : ""}`, "");
    });
  }

  if (profile.presentations.length) {
    lines.push("## Presentations and posters", "");
    profile.presentations.forEach((p) => {
      const meta = compact([p.kind, p.venue, p.date]).filter(Boolean).join(" · ");
      lines.push(`- **${p.title}**${meta ? ` — ${meta}` : ""}`, "");
    });
  }

  if (profile.projects.length) {
    lines.push("## Selected projects", "");
    profile.projects.forEach((project) => {
      lines.push(`### ${project.name}${project.url ? ` — ${project.url}` : ""}`);
      if (project.role) lines.push(`**Role:** ${project.role}  `);
      if (project.technologies?.length) lines.push(`**Tools:** ${project.technologies.join(", ")}  `);
      if (project.description) lines.push(project.description, "");
      lines.push(...bulletLines(project.bullets), "");
    });
  }

  pushOptionalSection(lines, "Honors and scholarships", profile.honors);
  pushOptionalSection(lines, "Grants and funding", profile.grants);
  pushOptionalSection(lines, "Professional service", profile.service);

  const skillKeys = Object.keys(profile.skills ?? {});
  if (skillKeys.length) {
    lines.push("## Technical skills", "");
    skillKeys.forEach((group) => {
      const skills = profile.skills[group] ?? [];
      if (skills.length) lines.push(`**${group}:** ${skills.join(", ")}  `);
    });
    lines.push("");
  }

  if (profile.languages.length) {
    lines.push("## Languages", "", ...profile.languages.map((item) => `${item}  `), "");
  }

  if (profile.standardizedTests.length) {
    lines.push("## Standardized tests", "");
    profile.standardizedTests.forEach((t) => {
      lines.push(`- **${t.name}**${t.score ? `: ${t.score}` : ""}${t.date ? ` (${t.date})` : ""}`, "");
    });
    lines.push("");
  }

  if (profile.references.length) {
    lines.push("## References", "");
    profile.references.forEach((ref) => {
      lines.push(`### ${ref.name}`, ...compact([ref.title, ref.affiliation, ref.email, ref.phone]).map((l) => `${l}  `), "");
    });
  }

  return lineBreak(lines);
}

export function renderCvMarkdown(profile: ResumeProfile) {
  const lines: string[] = [
    `# ${profile.personal.fullName}`,
    "",
    `**${profile.personal.headline}**  `,
    `${profile.personal.location} | ${profile.target.relocationLine}  `,
    ...compact([profile.personal.address, profile.personal.nationality ? `Nationality: ${profile.personal.nationality}` : undefined]).map((item) => `${item}  `),
    `Phone: ${profile.personal.phone} | Email: ${profile.personal.email}  `,
    `LinkedIn: ${profile.personal.linkedin} | GitHub: ${profile.personal.github} | Website: ${profile.personal.website}`,
    "",
    "## Professional Summary",
    "",
    ...profile.summary.flatMap((item) => [item, ""]),
    "## Core Skills",
    ""
  ];

  Object.entries(profile.skills).forEach(([group, skills]) => {
    lines.push(`**${group}:** ${skills.join(", ")}  `);
  });

  lines.push("", "## Professional Experience", "");
  profile.experience.forEach((job) => {
    const meta = compact([job.employmentType, `${job.start} - ${job.end}`]).join(" | ");
    lines.push(`### ${job.company}${job.location ? ` - ${job.location}` : ""}`, `**${job.title}**  `, meta, "");
    if (job.technologies?.length) lines.push(`**Technologies:** ${job.technologies.join(", ")}  `, "");
    lines.push(...bulletLines(job.bullets), "");
  });

  lines.push("## Key Projects", "");
  profile.projects.forEach((project) => {
    lines.push(`### ${project.name}${project.url ? ` - ${project.url}` : ""}`);
    if (project.role) lines.push(`**Role:** ${project.role}  `);
    if (project.technologies?.length) lines.push(`**Technologies:** ${project.technologies.join(", ")}  `);
    lines.push(project.description, "", ...bulletLines(project.bullets), "");
  });

  lines.push("## Education", "");
  profile.education.forEach((item) => {
    const degree = compact([item.degree, item.field]).join(" - ");
    const dates = compact([item.start, item.end || item.year]).join(" - ");
    const schoolLine = compact([item.school, item.location, dates]).join(" | ");
    lines.push(`**${degree}**  `, `${schoolLine}  `);
    if (item.gpa) lines.push(`GPA / Average: ${item.gpa}  `);
    if (item.honors?.length) lines.push(...bulletLines(item.honors));
    lines.push("");
  });

  pushOptionalSection(lines, "Certifications", profile.certifications);
  pushOptionalSection(lines, "Awards and Honors", profile.awards);
  pushOptionalSection(lines, "Publications", profile.publications);
  pushOptionalSection(lines, "Patents", profile.patents);
  pushOptionalSection(lines, "Volunteer and Community Work", profile.volunteer);

  lines.push("## Languages", "", ...profile.languages.map((item) => `${item}  `), "", "## Additional Information", "", `${profile.target.relocationLine}.  `);
  if (profile.target.availability) lines.push(`Availability: ${profile.target.availability}.  `);
  if (profile.target.preferredLocations?.length) lines.push(`Preferred locations: ${profile.target.preferredLocations.join(", ")}.  `);
  lines.push(`Target roles: ${profile.target.targetRoles.join(", ")}.`);
  return lineBreak(lines);
}

export function renderCoverLetterMarkdown(profile: ResumeProfile) {
  return lineBreak([
    "# Cover Letter",
    "",
    profile.coverLetter.greeting,
    "",
    profile.coverLetter.opening,
    "",
    "I bring more than 20 years of experience designing, modernizing, and operating enterprise and fintech software systems. In my current role, I led the modernization of a 19-year-old Delphi/MSSQL financial platform into a scalable service-oriented architecture using Node.js and React, delivered with zero downtime.",
    "",
    "My technical background covers Node.js, TypeScript, Python, SQL, React, Docker, Linux, Nginx, Cloudflare, VMware ESXi, BI platforms, and secure financial-grade system design. I have hands-on experience across software architecture, backend engineering, infrastructure, business intelligence, and engineering leadership.",
    "",
    "Beyond traditional enterprise systems, I have been actively working with AI-assisted software development workflows, production AI integration, and applied machine learning R&D.",
    "",
    profile.target.permitLine,
    "",
    profile.coverLetter.closing,
    "",
    "Sincerely,  ",
    `${profile.personal.fullName}  `,
    `${profile.personal.email}  `,
    `${profile.personal.phone}  `,
    `LinkedIn: ${profile.personal.linkedin}  `,
    `GitHub: ${profile.personal.github}  `,
    `Website: ${profile.personal.website}`
  ]);
}

export function renderEmailMarkdown(profile: ResumeProfile) {
  return lineBreak([
    "# Email Template",
    "",
    "## Subject",
    "",
    `Software Architect / Technical Lead - Open to Relocation to ${profile.target.country}`,
    "",
    "## Email Body",
    "",
    "Dear [Recruiter Name],",
    "",
    "I hope you are doing well.",
    "",
    "I am a Software Architect and Technical Lead with 20+ years of experience in fintech, enterprise systems, legacy modernization, backend architecture, and AI-enabled platforms. My main stack includes Node.js, TypeScript, Python, React, SQL, Docker, Linux, and service-oriented architecture.",
    "",
    `I am currently exploring ${profile.target.targetRoles.join(", ")} opportunities in ${profile.target.country}. ${profile.target.permitLine}`,
    "",
    "Please find my CV and cover letter attached. I would be happy to have a short call if my background matches any current or upcoming opportunities.",
    "",
    "Best regards,  ",
    `${profile.personal.fullName}  `,
    `${profile.personal.location}  `,
    `Email: ${profile.personal.email}  `,
    `Phone: ${profile.personal.phone}  `,
    `LinkedIn: ${profile.personal.linkedin}  `,
    `GitHub: ${profile.personal.github}  `,
    `Website: ${profile.personal.website}`
  ]);
}

export async function renderDocxFromMarkdown(markdown: string) {
  const children = markdown.split("\n").map((rawLine) => {
    const line = rawLine.replace(/\*\*/g, "").trimEnd();
    if (!line) return new Paragraph({ text: "" });
    if (line.startsWith("# ")) {
      return new Paragraph({ text: line.slice(2), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER });
    }
    if (line.startsWith("## ")) {
      return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 100 } });
    }
    if (line.startsWith("### ")) {
      return new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 } });
    }
    if (line.startsWith("- ")) {
      return new Paragraph({ text: line.slice(2), bullet: { level: 0 }, spacing: { after: 70 } });
    }
    return new Paragraph({ children: [new TextRun(line)], spacing: { after: 90 } });
  });

  const document = new Document({
    sections: [{ properties: {}, children }]
  });
  return Packer.toBuffer(document);
}

export async function renderDocx(profile: ResumeProfile, type: DocumentType) {
  const markdown = renderMarkdown(profile, type);
  return renderDocxFromMarkdown(markdown);
}

export async function renderPdfFromMarkdown(markdown: string) {
  const doc = new PDFDocument({ margin: 54, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  markdown.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/\*\*/g, "").trimEnd();
    if (!line) {
      doc.moveDown(0.35);
      return;
    }
    if (line.startsWith("# ")) {
      doc.fontSize(22).font("Helvetica-Bold").text(line.slice(2), { align: "center" }).moveDown(0.5);
      return;
    }
    if (line.startsWith("## ")) {
      doc.moveDown(0.35).fontSize(14).font("Helvetica-Bold").text(line.slice(3)).moveDown(0.2);
      return;
    }
    if (line.startsWith("### ")) {
      doc.fontSize(12).font("Helvetica-Bold").text(line.slice(4));
      return;
    }
    if (line.startsWith("- ")) {
      doc.fontSize(10).font("Helvetica").text(`• ${line.slice(2)}`, { indent: 14 });
      return;
    }
    doc.fontSize(10).font("Helvetica").text(line, { lineGap: 2 });
  });

  doc.end();
  return done;
}

export async function renderPdf(profile: ResumeProfile, type: DocumentType) {
  const markdown = renderMarkdown(profile, type);
  return renderPdfFromMarkdown(markdown);
}

export function contentType(format: ExportFormat) {
  if (format === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (format === "pdf") return "application/pdf";
  return "text/markdown; charset=utf-8";
}
