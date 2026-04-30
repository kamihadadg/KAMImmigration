import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** @deprecated Use `/register` */
export default async function LegacyRegisterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  const err = sp.error;
  if (typeof err === "string") q.set("error", err);
  const suffix = q.size ? `?${q}` : "";
  redirect(`/register${suffix}`);
}
