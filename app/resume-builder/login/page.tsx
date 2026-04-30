import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

/** @deprecated Use `/login` */
export default async function LegacyLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (error) redirect(`/login?error=${encodeURIComponent(error)}`);
  redirect("/login");
}
