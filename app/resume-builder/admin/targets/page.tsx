import { redirect } from "next/navigation";

export default function LegacyAdminTargetsPage() {
  redirect("/admin/targets?kind=work");
}
