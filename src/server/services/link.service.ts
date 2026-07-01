import bcrypt from "bcryptjs";

import { generateShortCode, isReservedSlug } from "@/lib/slug";
import { validateSafeUrl } from "@/server/services/url-safety.service";
import { prisma } from "@/server/db/prisma";
import type { CreateLinkInput, UpdateLinkInput } from "@/features/links/schemas/link.schema";

async function generateUniqueShortCode(preferred?: string): Promise<string> {
  if (preferred) {
    if (isReservedSlug(preferred)) throw new Error("That slug is reserved.");
    const existing = await prisma.link.findUnique({ where: { shortCode: preferred }, select: { id: true } });
    if (existing) throw new Error("That custom slug is already taken.");
    // also check guest links namespace
    const guestExisting = await prisma.guestLink.findUnique({ where: { shortCode: preferred }, select: { id: true } });
    if (guestExisting) throw new Error("That custom slug is already taken.");
    return preferred;
  }

  for (let i = 0; i < 10; i++) {
    const code = generateShortCode(7);
    if (isReservedSlug(code)) continue;
    const exists = await prisma.link.findUnique({ where: { shortCode: code }, select: { id: true } });
    if (!exists) {
      const guestExists = await prisma.guestLink.findUnique({ where: { shortCode: code }, select: { id: true } });
      if (!guestExists) return code;
    }
  }
  throw new Error("Could not generate a unique short code. Please try again.");
}

export async function createLinkService(params: {
  input: CreateLinkInput;
  userId: string;
  workspaceId: string;
}) {
  const { input, userId, workspaceId } = params;

  const safeUrl = validateSafeUrl(input.originalUrl);
  const shortCode = await generateUniqueShortCode(input.customSlug || undefined);

  const password = input.password?.trim();
  const hasPassword = Boolean(password);
  const passwordHash = hasPassword ? await bcrypt.hash(password!, 10) : null;

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const maxClicks = input.maxClicks ? Number(input.maxClicks) : null;
  const tags = input.tags
    ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return prisma.link.create({
    data: {
      userId,
      workspaceId,
      title: input.title?.trim() || null,
      originalUrl: safeUrl,
      shortCode,
      passwordHash,
      isPasswordProtected: hasPassword,
      expiresAt,
      maxClicks,
      notes: input.notes?.trim() || null,
      tags,
    },
  });
}

export async function updateLinkService(params: {
  id: string;
  userId: string;
  input: UpdateLinkInput;
}) {
  const { id, userId, input } = params;

  const link = await prisma.link.findFirst({
    where: { id, workspace: { members: { some: { userId } } } },
    select: { id: true },
  });
  if (!link) throw new Error("Link not found.");

  const password = input.password?.trim();
  const hasPassword = Boolean(password);

  return prisma.link.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title?.trim() || null }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.clearPassword
        ? { passwordHash: null, isPasswordProtected: false }
        : hasPassword
          ? { passwordHash: await bcrypt.hash(password!, 10), isPasswordProtected: true }
          : {}),
      ...(input.clearExpiry
        ? { expiresAt: null }
        : input.expiresAt
          ? { expiresAt: new Date(input.expiresAt) }
          : {}),
      ...(input.clearMaxClicks
        ? { maxClicks: null }
        : input.maxClicks
          ? { maxClicks: Number(input.maxClicks) }
          : {}),
      ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
      ...(input.tags !== undefined && {
        tags: input.tags
          ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }),
    },
  });
}

export async function deleteLinkService(id: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: { id, workspace: { members: { some: { userId } } } },
    select: { id: true },
  });
  if (!link) throw new Error("Link not found.");
  await prisma.link.delete({ where: { id } });
}
