import { redirect } from "next/navigation";

type LanguageDayAliasPageProps = {
  params: Promise<{ day: string }>;
};

export default async function LanguageDayAliasPage({ params }: LanguageDayAliasPageProps) {
  const { day } = await params;
  redirect(`/learn/day/${day}`);
}
