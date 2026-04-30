"use client";

import { useRouter } from "next/navigation";
import { isLocale, languages, localeCookieName, type Locale } from "@/lib/i18n/config";

type Props = {
  current: Locale;
  /** Accessibility label (pass from server translations). */
  ariaLabel: string;
};

export function LanguageSwitcher({ current, ariaLabel }: Props) {
  const router = useRouter();

  function pick(next: string) {
    if (!isLocale(next) || next === current) return;
    document.cookie = `${localeCookieName}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className="flex shrink-0 items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-[11px] font-black uppercase tracking-wide"
      role="group"
      aria-label={ariaLabel}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => pick(lang.code)}
          className={`rounded-full px-2.5 py-1 transition ${
            current === lang.code ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          {lang.shortLabel}
        </button>
      ))}
    </div>
  );
}
