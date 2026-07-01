import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

// In-process rate limit: max 3 requests per email per 15 minutes
const resetAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = resetAttempts.get(email);
  if (!entry || entry.resetAt < now) {
    resetAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const normalized = email.toLowerCase().trim();

  // Always return success — rate limit silently no-ops to prevent enumeration
  if (isRateLimited(normalized)) {
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, password: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${user.email}` } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${user.email}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  try {
    await sendPasswordResetEmail(user.email!, token);
  } catch { /* silent */ }

  return NextResponse.json({ success: true });
}
