import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedClips } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-whop-user-id");
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { clipId } = body as { clipId: string };
  if (!clipId) return NextResponse.json({ error: "Missing clipId" }, { status: 400 });
  await db.insert(savedClips).values({ id: `${userId}-${clipId}`, userId, clipId }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { clipId } = body as { clipId: string };
  if (!clipId) return NextResponse.json({ error: "Missing clipId" }, { status: 400 });
  await db.delete(savedClips).where(and(eq(savedClips.userId, userId), eq(savedClips.clipId, clipId)));
  return NextResponse.json({ ok: true });
}


