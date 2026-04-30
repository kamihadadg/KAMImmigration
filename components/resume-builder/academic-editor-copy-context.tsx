"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Messages } from "@/lib/i18n/messages";

export type AcademicEditorCopy = Messages["editorAcademic"];

const Ctx = createContext<AcademicEditorCopy | null>(null);

export function AcademicEditorCopyProvider({ value, children }: { value: AcademicEditorCopy; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAcademicEditorCopy(): AcademicEditorCopy {
  const v = useContext(Ctx);
  if (!v) throw new Error("AcademicEditorCopyProvider required");
  return v;
}
