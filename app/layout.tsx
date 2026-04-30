import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { GlobalTopNav } from "@/components/global-top-nav";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/messages";
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} ${locale === "fa" ? "font-fa" : ""}`}
      >
        <GlobalTopNav />
        {children}
      </body>
    </html>
  );
}
