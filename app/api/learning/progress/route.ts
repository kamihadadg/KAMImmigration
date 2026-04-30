import { NextRequest, NextResponse } from "next/server";
import { updateProgressBlocks } from "@/lib/learning/progress";
import { getCurrentUser } from "@/lib/resume-builder/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { day?: number; blocks?: Record<string, boolean> };
  if (!Number.isInteger(body.day) || !body.day || body.day < 1 || !body.blocks) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  updateProgressBlocks(user.id, body.day, body.blocks);
  return NextResponse.json({ ok: true });
}
