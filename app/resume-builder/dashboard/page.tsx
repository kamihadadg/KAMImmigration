import { redirect } from "next/navigation";

/** Legacy URL: combined dashboard split into /dashboard (hub) and /dashboard/{work,study,language}. */
export default function LegacyResumeBuilderDashboardRedirect() {
  redirect("/dashboard");
}
