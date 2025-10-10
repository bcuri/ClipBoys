import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Simple helper to read Whop user from headers (adjust as needed)
function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-whop-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return NextResponse.json({ user: user ?? null });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = body.name ?? null;
  const email = body.email ?? null;

  await db
    .insert(users)
    .values({ id: userId, name, email })
    .onConflictDoUpdate({
      target: users.id,
      set: { name, email },
    });

  return NextResponse.json({ ok: true });
}


