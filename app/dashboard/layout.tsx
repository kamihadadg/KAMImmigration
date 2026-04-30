import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/resume-builder/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await getCurrentUser())) {
    redirect("/login");
  }
  return children;
}
