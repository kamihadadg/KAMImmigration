import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getResume } from "@/lib/resume-builder/resumes";

type ResumeAcademicEditorAliasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResumeAcademicEditorAliasPage({ params }: ResumeAcademicEditorAliasPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) redirect("/dashboard");
  const resume = getResume(user.id, resumeId);
  if (!resume || resume.kind !== "academic") redirect("/dashboard");
  redirect(`/resume-builder/academic-editor/${id}`);
}
