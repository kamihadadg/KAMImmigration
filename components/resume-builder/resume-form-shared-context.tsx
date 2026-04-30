"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Messages } from "@/lib/i18n/messages";

export type EditorSharedCopy = Messages["editorShared"];

const Ctx = createContext<EditorSharedCopy | null>(null);

export function ResumeFormSharedProvider({ value, children }: { value: EditorSharedCopy; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useResumeFormShared(): EditorSharedCopy {
  const v = useContext(Ctx);
  if (!v) throw new Error("ResumeFormSharedProvider required");
  return v;
}
