import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatedClips, savedClips } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-whop-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const savedOnly = searchParams.get("saved") === "1";

  if (savedOnly) {
    const saved = await db.select().from(savedClips).where(eq(savedClips.userId, userId)).orderBy(desc(savedClips.createdAt));
    const clipIds = saved.map((s) => s.clipId);
    if (clipIds.length === 0) return NextResponse.json({ clips: [] });
    const rows = await db.select().from(generatedClips).where(inArray(generatedClips.id, clipIds));
    return NextResponse.json({ clips: rows });
  }

  const rows = await db
    .select()
    .from(generatedClips)
    .where(eq(generatedClips.userId, userId))
    .orderBy(desc(generatedClips.createdAt));
  return NextResponse.json({ clips: rows });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { clips } = body as { clips: Array<{ id: string; videoId: string; title: string; description?: string; startSec: number; endSec: number; score?: number; thumbnailUrl?: string }>; };
  if (!Array.isArray(clips)) return NextResponse.json({ error: "Missing clips" }, { status: 400 });
  if (clips.length === 0) return NextResponse.json({ ok: true });
  await db.insert(generatedClips).values(clips.map((c) => ({ ...c, userId })));
  return NextResponse.json({ ok: true });
}


