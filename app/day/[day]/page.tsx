import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getLessonBundle, getOverview } from "@/lib/content";

type DayPageProps = {
  params: Promise<{
    day: string;
  }>;
};

export default async function DayPage({ params }: DayPageProps) {
  const { day } = await params;
  const selectedDay = Number(day);
  const overview = await getOverview();

  if (!Number.isInteger(selectedDay) || selectedDay < 1 || selectedDay > overview.totalDays) {
    notFound();
  }

  const bundle = await getLessonBundle(selectedDay);

  return <AppShell overview={overview} bundle={bundle} />;
}

export async function generateStaticParams() {
  return Array.from({ length: 180 }, (_, index) => ({
    day: String(index + 1)
  }));
}
