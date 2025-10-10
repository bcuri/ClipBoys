import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-whop-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(videos).where(eq(videos.userId, userId)).orderBy(desc(videos.createdAt));
  return NextResponse.json({ videos: rows });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { videoId, title, thumbnailUrl } = body;
  if (!videoId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await db.insert(videos).values({ id: videoId, userId, title, thumbnailUrl });
  return NextResponse.json({ ok: true });
}


