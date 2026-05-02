import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { GlobalTopNav } from "@/components/global-top-nav";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
import { APP_THEME_COOKIE, parseAppTheme } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"]
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = getMessages(locale);
  return {
    title: m.meta.title,
    description: m.meta.description
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const cookieStore = await cookies();
  const appTheme = parseAppTheme(cookieStore.get(APP_THEME_COOKIE)?.value);

  return (
    <html lang={locale} dir={dir} data-app-theme={appTheme} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} ${locale === "fa" ? "font-fa" : ""}`}
      >
        <GlobalTopNav appTheme={appTheme} />
        {children}
      </body>
    </html>
  );
}
