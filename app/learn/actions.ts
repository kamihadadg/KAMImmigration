"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/resume-builder/auth";
import { getDayProgress, upsertProgress } from "@/lib/learning/progress";

function lessonBlocks(formData: FormData) {
  const labels = String(formData.get("blockLabels") ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!labels.length) return null;
  return labels.reduce<Record<string, boolean>>((blocks, label) => {
    blocks[label] = formData.get(`block.${label}`) === "on";
    return blocks;
  }, {});
}

export async function saveLearningProgressAction(formData: FormData) {
  const user = await requireUser();
  const day = Number(formData.get("day"));
  const completed = formData.get("completed") === "on";
  const notes = String(formData.get("notes") ?? "");
  if (!Number.isInteger(day) || day < 1) {
    redirect("/learn");
  }
  const blocks = lessonBlocks(formData) ?? getDayProgress(user.id, day).blocks;
  upsertProgress(user.id, day, completed, notes, blocks);
  redirect(`/learn/day/${day}?saved=1#progress`);
}
