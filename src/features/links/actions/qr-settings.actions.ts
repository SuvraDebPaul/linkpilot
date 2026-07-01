"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { isReservedSlug } from "@/lib/slug";

const schema = z.object({
  fgColor:        z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  bgColor:        z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  ecLevel:        z.enum(["L", "M", "Q", "H"]).default("M"),
  margin:         z.number().int().min(0).max(4).default(2),
  logoUrl:        z.string().url().optional().or(z.literal("")),
  customDomainId: z.string().trim().optional().or(z.literal("")),
  customSlug: z
    .string()
    .trim()
    .min(3, "Custom slug must be at least 3 characters")
    .max(64, "Custom slug is too long")
    .regex(/^[a-z0-9-_]+$/, "Only lowercase letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
});

type Input = z.infer<typeof schema>;

type Result = { success: true } | { success: false; message: string };

export async function saveQrSettingsAction(linkId: string, input: Input): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid settings." };

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true, shortCode: true, workspaceId: true },
  });
  if (!link) return { success: false, message: "Link not found." };

  const { fgColor, bgColor, ecLevel, margin, logoUrl, customDomainId, customSlug } = parsed.data;

  // Custom domain — only a verified domain belonging to this workspace may be used
  let resolvedDomainId: string | null | undefined;
  if (customDomainId !== undefined) {
    if (customDomainId === "") {
      resolvedDomainId = null;
    } else {
      const domain = await prisma.customDomain.findFirst({
        where: { id: customDomainId, workspaceId: link.workspaceId, status: "VERIFIED" },
        select: { id: true },
      });
      if (!domain) return { success: false, message: "Selected domain was not found or is not verified." };
      resolvedDomainId = domain.id;
    }
  }

  // Short code rename — only when it actually changed
  let resolvedShortCode: string | undefined;
  if (customSlug && customSlug !== link.shortCode) {
    if (isReservedSlug(customSlug)) {
      return { success: false, message: "That slug is reserved." };
    }
    const existing = await prisma.link.findUnique({ where: { shortCode: customSlug }, select: { id: true } });
    if (existing && existing.id !== linkId) {
      return { success: false, message: "That custom slug is already taken." };
    }
    const guestExisting = await prisma.guestLink.findUnique({ where: { shortCode: customSlug }, select: { id: true } });
    if (guestExisting) {
      return { success: false, message: "That custom slug is already taken." };
    }
    resolvedShortCode = customSlug;
  }

  await prisma.link.update({
    where: { id: linkId },
    data: {
      qrFgColor: fgColor,
      qrBgColor: bgColor,
      qrEcLevel: ecLevel,
      qrMargin:  margin,
      qrLogoUrl: logoUrl || null,
      ...(resolvedDomainId !== undefined && { customDomainId: resolvedDomainId }),
      ...(resolvedShortCode !== undefined && { shortCode: resolvedShortCode }),
    },
  });

  revalidatePath(`/dashboard/links/${linkId}`);
  revalidatePath(`/dashboard/links/${linkId}/edit`);
  revalidatePath("/dashboard/links");
  return { success: true };
}
