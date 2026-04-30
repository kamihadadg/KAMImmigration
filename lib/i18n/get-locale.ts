import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const raw = (await cookies()).get(localeCookieName)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}
