import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/resume-builder/auth";

export default async function ResumeAliasPage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard/work" : "/login");
}
