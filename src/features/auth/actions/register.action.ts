"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";

import { prisma } from "@/server/db/prisma";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { sendVerificationEmail } from "@/lib/email";
import { isFeatureEnabled } from "@/lib/feature-flags";

type RegisterResult =
  | { success: true; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export async function registerAction(input: unknown): Promise<RegisterResult> {
  // Missing flag row means "not configured" — defaults to enabled since
  // signups are on by default and this is a manual kill switch, not an opt-in.
  if (!(await isFeatureEnabled("signupsEnabled", true))) {
    return { success: false, message: "New signups are temporarily disabled. Please check back soon." };
  }

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

  let user: { id: string };
  try {
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

    user = await prisma.user.create({
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
  } catch (err) {
    // A unique-constraint violation here means a concurrent double-submit
    // raced past the dup-check above (two requests both saw "no existing
    // user" before either INSERT committed) — report it the same way as the
    // normal dup-check. Anything else is a genuine, unrelated failure.
    const isDuplicate =
      err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002";
    return isDuplicate
      ? {
          success: false,
          message: "An account with this email already exists.",
          fieldErrors: { email: ["Email is already in use"] },
        }
      : { success: false, message: "Something went wrong creating your account. Please try again." };
  }

  try {
    const hdrs = await headers();
    const forwardedFor = hdrs.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";
    const userAgent = hdrs.get("user-agent") ?? "";
    const browser = /Chrome/.test(userAgent)
      ? "Chrome"
      : /Firefox/.test(userAgent)
        ? "Firefox"
        : /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
          ? "Safari"
          : /Edg/.test(userAgent)
            ? "Edge"
            : "Unknown";
    await prisma.loginEvent.create({ data: { userId: user.id, type: "registration", ip, browser } });
  } catch {
    // Non-critical — don't block registration on activity logging
  }

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
