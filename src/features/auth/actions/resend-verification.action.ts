"use server";

import crypto from "crypto";

import { prisma } from "@/server/db/prisma";
import { sendVerificationEmail } from "@/lib/email";

// Always returns the same generic success message regardless of whether the
// email matches an account, is already verified, or belongs to a Google-only
// user — so this can't be used to enumerate which emails are registered.
export async function resendVerificationAction(email: string): Promise<{ message: string }> {
  const generic = { message: "If that account needs verifying, we've sent a new link." };

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, emailVerified: true, password: true },
  });

  // No credentials password means this is a Google-only account — nothing to verify.
  if (!user || user.emailVerified || !user.password) return generic;

  try {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await sendVerificationEmail(normalizedEmail, token);
  } catch {
    // Swallow — response stays generic either way
  }

  return generic;
}
