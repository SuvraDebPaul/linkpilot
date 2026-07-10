import bcrypt from "bcryptjs";

import { generateShortCode, isReservedSlug, counterToSlug, shortCodeLengthForStyle, type SlugStyle } from "@/lib/slug";
import { validateSafeUrl } from "@/server/services/url-safety.service";
import { enforceDemoRedirect } from "@/server/services/demo-guard.service";
import { prisma } from "@/server/db/prisma";
import type { CreateLinkInput, UpdateLinkInput } from "@/features/links/schemas/link.schema";

async function generateUniqueShortCode(
  workspaceId: string,
  slugStyle: SlugStyle,
  preferred?: string,
): Promise<string> {
  if (preferred) {
    if (isReservedSlug(preferred)) throw new Error("That slug is reserved.");
    const existing = await prisma.link.findUnique({ where: { shortCode: preferred }, select: { id: true } });
    if (existing) throw new Error("That custom slug is already taken.");
    // also check guest links namespace
    const guestExisting = await prisma.guestLink.findUnique({ where: { shortCode: preferred }, select: { id: true } });
    if (guestExisting) throw new Error("That custom slug is already taken.");
    return preferred;
  }

  if (slugStyle === "incremental") {
    for (let i = 0; i < 10; i++) {
      const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { slugCounter: { increment: 1 } },
        select: { slugCounter: true },
      });
      const code = counterToSlug(workspace.slugCounter);
      if (isReservedSlug(code)) continue;
      const exists = await prisma.link.findUnique({ where: { shortCode: code }, select: { id: true } });
      if (!exists) return code;
    }
    throw new Error("Could not generate a unique short code. Please try again.");
  }

  const length = shortCodeLengthForStyle(slugStyle);
  for (let i = 0; i < 10; i++) {
    const code = generateShortCode(length);
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
  campaignId?: string | null;
  customDomainId?: string | null;
  redirectType?: string;
  qrFgColor?: string;
  qrBgColor?: string;
  qrEcLevel?: string;
  qrMargin?: number;
}) {
  const { input, userId, workspaceId, campaignId, customDomainId, redirectType, qrFgColor, qrBgColor, qrEcLevel, qrMargin } = params;

  const workspaceDefaults = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      slugStyle: true,
      defaultRedirectType: true,
      defaultCloakingEnabled: true,
      defaultQrFgColor: true,
      defaultQrBgColor: true,
      defaultQrEcLevel: true,
    },
  });
  const slugStyle = (workspaceDefaults?.slugStyle ?? "random") as SlugStyle;

  const safeUrl = validateSafeUrl(await enforceDemoRedirect(userId, input.originalUrl));
  const shortCode = await generateUniqueShortCode(workspaceId, slugStyle, input.customSlug || undefined);

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
      campaignId: campaignId || null,
      customDomainId: customDomainId || null,
      title: input.title?.trim() || null,
      originalUrl: safeUrl,
      shortCode,
      passwordHash,
      isPasswordProtected: hasPassword,
      expiresAt,
      maxClicks,
      notes: input.notes?.trim() || null,
      tags,
      redirectType: redirectType || workspaceDefaults?.defaultRedirectType || "302",
      isCloaked: workspaceDefaults?.defaultCloakingEnabled ?? false,
      qrFgColor: qrFgColor || workspaceDefaults?.defaultQrFgColor || "#000000",
      qrBgColor: qrBgColor || workspaceDefaults?.defaultQrBgColor || "#ffffff",
      qrEcLevel: qrEcLevel || workspaceDefaults?.defaultQrEcLevel || "M",
      ...(qrMargin !== undefined && { qrMargin }),
    },
  });
}

export async function updateLinkService(params: {
  id: string;
  userId: string;
  input: UpdateLinkInput;
  campaignId?: string | null;
  customDomainId?: string | null;
}) {
  const { id, userId, input, campaignId, customDomainId } = params;

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
      ...(campaignId !== undefined && { campaignId }),
      ...(customDomainId !== undefined && { customDomainId }),
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
