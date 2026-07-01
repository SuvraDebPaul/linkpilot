import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { resolveSlug } from "@/server/redirects/resolve-slug";

const UNLOCK_COOKIE_PREFIX = "linkpilot_unlock_";

export function getUnlockCookieName(slug: string) {
  return `${UNLOCK_COOKIE_PREFIX}${slug}`;
}

export async function hasUnlockAccess(slug: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(getUnlockCookieName(slug));

  return cookie?.value === "true";
}

export async function unlockProtectedLink(params: {
  slug: string;
  password: string;
}) {
  const resolved = await resolveSlug(params.slug);

  if (!resolved || !resolved.isActive) {
    return {
      success: false,
      message: "This link is unavailable.",
    };
  }

  if (resolved.expiresAt !== null && resolved.expiresAt < new Date()) {
    return {
      success: false,
      message: "This link has expired.",
    };
  }

  if (!resolved.passwordHash) {
    return {
      success: true,
      message: "This link does not require a password.",
    };
  }

  const isValid = await bcrypt.compare(params.password, resolved.passwordHash);

  if (!isValid) {
    return {
      success: false,
      message: "Incorrect password.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(getUnlockCookieName(params.slug), "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return {
    success: true,
    message: "Link unlocked.",
  };
}
