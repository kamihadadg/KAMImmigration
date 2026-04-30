import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/resume-builder/auth";
import { getResume } from "@/lib/resume-builder/resumes";

type ResumeEditorAliasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResumeEditorAliasPage({ params }: ResumeEditorAliasPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const resumeId = Number(id);
  if (!Number.isInteger(resumeId)) redirect("/dashboard");
  const resume = getResume(user.id, resumeId);
  if (!resume) redirect("/dashboard");
  if (resume.kind === "academic") {
    redirect(`/resume-builder/academic-editor/${id}`);
  }
  redirect(`/resume-builder/editor/${id}`);
}
