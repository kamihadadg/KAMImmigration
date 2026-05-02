"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { APP_THEME_COOKIE, APP_THEME_STORAGE, type AppBacklitTheme } from "@/lib/theme";

type Props = {
  initialTheme: AppBacklitTheme;
  labels: { ariaToggle: string; switchToDay: string; switchToNight: string };
};

export function ThemeToggle({ initialTheme, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [theme, setTheme] = useState<AppBacklitTheme>(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-app-theme", initialTheme);
  }, [initialTheme]);

  function apply(next: AppBacklitTheme) {
    document.documentElement.setAttribute("data-app-theme", next);
    try {
      localStorage.setItem(APP_THEME_STORAGE, next);
    } catch {
      /* ignore */
    }
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${APP_THEME_COOKIE}=${next};path=/;max-age=${maxAge};SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  function toggle() {
    const next: AppBacklitTheme = theme === "night" ? "day" : "night";
    setTheme(next);
    apply(next);
  }

  const isNight = theme === "night";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="global-theme-toggle inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-60"
      aria-label={labels.ariaToggle}
      aria-pressed={!isNight}
      title={isNight ? labels.switchToDay : labels.switchToNight}
    >
      {isNight ? <Sun size={18} strokeWidth={2.25} aria-hidden /> : <Moon size={18} strokeWidth={2.25} aria-hidden />}
    </button>
  );
}
