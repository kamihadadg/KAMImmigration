import { NextRequest, NextResponse } from "next/server";
import { EXPORT_CREDIT_COST, recordExportUsage } from "@/lib/resume-builder/admin";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getResume } from "@/lib/resume-builder/resumes";
import {
  contentType,
  renderAcademicCvMarkdown,
  renderDocxFromMarkdown,
  renderMarkdown,
  renderPdfFromMarkdown,
  type DocumentType,
  type ExportFormat
} from "@/lib/resume-builder/renderers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportRouteProps = {
  params: Promise<{ id: string }>;
};

const jobDocumentTypes = new Set(["cv", "cover-letter", "email"]);
const academicDocumentTypes = new Set(["academic-cv"]);
const formats = new Set(["md", "docx", "pdf"]);

export async function GET(request: NextRequest, { params }: ExportRouteProps) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) return new NextResponse("Invalid resume id", { status: 400 });

  const type = request.nextUrl.searchParams.get("type") || "cv";
  const format = request.nextUrl.searchParams.get("format") || "pdf";
  if (!formats.has(format)) {
    return new NextResponse("Invalid export format", { status: 400 });
  }

  const resume = getResume(user.id, resumeId);
  if (!resume) return new NextResponse("Not found", { status: 404 });

  if (resume.kind === "academic") {
    if (!academicDocumentTypes.has(type)) {
      return new NextResponse("Academic CVs only support type=academic-cv", { status: 400 });
    }
  } else if (!jobDocumentTypes.has(type)) {
    return new NextResponse("Job resumes do not support academic-cv export; use cv, cover-letter, or email.", { status: 400 });
  }

  const safeTitle = resume.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  const filename = `${safeTitle || "resume"}_${type.replace(/-/g, "_")}.${format}`;
  let body: BodyInit;

  if (resume.kind === "academic") {
    const markdown = renderAcademicCvMarkdown(resume.profile);
    if (format === "docx") {
      body = new Uint8Array(await renderDocxFromMarkdown(markdown));
    } else if (format === "pdf") {
      body = new Uint8Array(await renderPdfFromMarkdown(markdown));
    } else {
      body = markdown;
    }
  } else if (format === "docx") {
    body = new Uint8Array(await renderDocxFromMarkdown(renderMarkdown(resume.profile, type as DocumentType)));
  } else if (format === "pdf") {
    body = new Uint8Array(await renderPdfFromMarkdown(renderMarkdown(resume.profile, type as DocumentType)));
  } else {
    body = renderMarkdown(resume.profile, type as DocumentType);
  }

  const usage = recordExportUsage(user.id, resume.id, type, format);
  if (!usage.allowed) {
    return new NextResponse(`Not enough credits. Each export costs ${EXPORT_CREDIT_COST} credit.`, { status: 402 });
  }

  return new NextResponse(body, {
    headers: {
      "content-type": contentType(format as ExportFormat),
      "content-disposition": `attachment; filename="${filename}"`,
      "x-credits-charged": String(usage.cost)
    }
  });
}
