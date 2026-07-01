"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/server/db/prisma";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { sendVerificationEmail } from "@/lib/email";

type RegisterResult =
  | { success: true; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export async function registerAction(input: unknown): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your input.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return {
      success: false,
      message: "An account with this email already exists.",
      fieldErrors: { email: ["Email is already in use"] },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: passwordHash,
    },
    select: { id: true },
  });

  // Create a default personal workspace for the new user
  const workspaceSlug = `${normalizedEmail.split("@")[0]}-${user.id.slice(-6)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug: workspaceSlug,
    },
    select: { id: true },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "OWNER",
    },
  });

  // Send verification email (fire-and-forget; don't block registration on email errors)
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
    // Email send failed — user can still sign in; we skip enforcing verification for now
  }

  return { success: true, message: "Account created! Check your email to verify your address." };
}
