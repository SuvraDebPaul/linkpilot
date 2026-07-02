"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, canCreateLink, PLAN_LIMITS, getUserUsage } from "@/lib/subscription";
import { checkAuthLinkRateLimit } from "@/lib/rate-limit";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { createLinkSchema, updateLinkSchema } from "@/features/links/schemas/link.schema";
import {
  createLinkService,
  deleteLinkService,
  updateLinkService,
} from "@/server/services/link.service";

type ActionResult =
  | { success: true; message: string; data?: Record<string, unknown> }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

async function getAuthContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const workspaceId = await ensureWorkspace(userId);

  return { userId, workspaceId };
}

export async function createLinkAction(input: unknown): Promise<ActionResult> {
  const parsed = createLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please check your input.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { userId, workspaceId } = await getAuthContext();

    // Short-term burst rate limit (20 links per minute)
    const withinRateLimit = await checkAuthLinkRateLimit(userId);
    if (!withinRateLimit) {
      return { success: false, message: "Too many links created in a short period. Please wait a moment." };
    }

    // Enforce plan limits
    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].links;
    if (isFinite(limit)) {
      // Free plan uses lifetime counter; paid plans use current active count
      const count = plan === "free"
        ? (await getUserUsage(userId)).linksCreated
        : await prisma.link.count({ where: { userId } });
      if (!canCreateLink(plan, count)) {
        return {
          success: false,
          message: plan === "free"
            ? `You've used your ${limit}-link free allowance. Upgrade to create more links.`
            : `You've reached the ${limit}-link limit on the ${plan} plan. Upgrade to Pro for unlimited links.`,
        };
      }
    }

    // Campaign assignment — verify the campaign actually belongs to this workspace
    let campaignId: string | null = null;
    if (parsed.data.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: parsed.data.campaignId, workspaceId },
        select: { id: true },
      });
      if (!campaign) {
        return { success: false, message: "Selected campaign was not found." };
      }
      campaignId = campaign.id;
    }

    // Custom domain — only a verified domain belonging to this workspace may be used
    let customDomainId: string | null = null;
    if (parsed.data.customDomainId) {
      const domain = await prisma.customDomain.findFirst({
        where: { id: parsed.data.customDomainId, workspaceId, status: "VERIFIED" },
        select: { id: true },
      });
      if (!domain) {
        return { success: false, message: "Selected domain was not found or is not verified." };
      }
      customDomainId = domain.id;
    }

    // Redirect type and QR styling are paid-plan features — strip them for
    // free accounts instead of trusting the client to have gated the UI.
    const isPaidPlan = plan === "starter" || plan === "pro";

    const link = await createLinkService({
      input: parsed.data,
      userId,
      workspaceId,
      campaignId,
      customDomainId,
      redirectType: isPaidPlan ? parsed.data.redirectType : undefined,
      qrFgColor: isPaidPlan ? (parsed.data.qrFgColor || undefined) : undefined,
      qrBgColor: isPaidPlan ? (parsed.data.qrBgColor || undefined) : undefined,
      qrEcLevel: isPaidPlan ? parsed.data.qrEcLevel : undefined,
      qrMargin: isPaidPlan && parsed.data.qrMargin !== undefined && parsed.data.qrMargin !== ""
        ? Number(parsed.data.qrMargin)
        : undefined,
    });

    // Increment lifetime counter (free plan tracking)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalLinksCreated: { increment: 1 } },
      select: { totalLinksCreated: true },
    });
    revalidatePath("/dashboard/links");

    const newUsedCount = plan === "free" ? updatedUser.totalLinksCreated : await prisma.link.count({ where: { userId } });
    const limitRemaining = isFinite(limit) ? limit - newUsedCount : Infinity;

    return { success: true, message: "Link created.", data: { id: link.id, shortCode: link.shortCode, limitRemaining } };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to create link." };
  }
}

export async function updateLinkAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = updateLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please check your input.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { userId, workspaceId } = await getAuthContext();

    // Campaign assignment — "" clears it, undefined leaves it untouched
    let campaignId: string | null | undefined;
    if (parsed.data.campaignId !== undefined) {
      if (parsed.data.campaignId === "") {
        campaignId = null;
      } else {
        const campaign = await prisma.campaign.findFirst({
          where: { id: parsed.data.campaignId, workspaceId },
          select: { id: true },
        });
        if (!campaign) return { success: false, message: "Selected campaign was not found." };
        campaignId = campaign.id;
      }
    }

    // Custom domain — only a verified domain belonging to this workspace may be used
    let customDomainId: string | null | undefined;
    if (parsed.data.customDomainId !== undefined) {
      if (parsed.data.customDomainId === "") {
        customDomainId = null;
      } else {
        const domain = await prisma.customDomain.findFirst({
          where: { id: parsed.data.customDomainId, workspaceId, status: "VERIFIED" },
          select: { id: true },
        });
        if (!domain) return { success: false, message: "Selected domain was not found or is not verified." };
        customDomainId = domain.id;
      }
    }

    await updateLinkService({ id, userId, input: parsed.data, campaignId, customDomainId });
    revalidatePath("/dashboard/links");
    revalidatePath(`/dashboard/links/${id}`);
    return { success: true, message: "Link updated." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to update link." };
  }
}

export async function deleteLinkAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await getAuthContext();
    await deleteLinkService(id, userId);
    revalidatePath("/dashboard/links");
    return { success: true, message: "Link deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete link." };
  }
}

export async function toggleFavoriteLinkAction(id: string, isFavorite: boolean): Promise<ActionResult> {
  try {
    const { userId } = await getAuthContext();
    const link = await prisma.link.findFirst({
      where: { id, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    if (!link) return { success: false, message: "Link not found." };
    await prisma.link.update({ where: { id }, data: { isFavorite } });
    revalidatePath("/dashboard/links");
    return { success: true, message: isFavorite ? "Added to favorites." : "Removed from favorites." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to update favorite." };
  }
}

export async function duplicateLinkAction(id: string): Promise<ActionResult> {
  try {
    const { userId, workspaceId } = await getAuthContext();

    const original = await prisma.link.findFirst({
      where: { id, workspace: { members: { some: { userId } } } },
      select: { originalUrl: true, title: true, notes: true, tags: true },
    });
    if (!original) return { success: false, message: "Link not found." };

    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].links;
    if (isFinite(limit)) {
      const count = plan === "free"
        ? (await getUserUsage(userId)).linksCreated
        : await prisma.link.count({ where: { userId } });
      if (!canCreateLink(plan, count)) {
        return { success: false, message: "Link limit reached. Upgrade to duplicate more links." };
      }
    }

    const link = await createLinkService({
      input: {
        originalUrl: original.originalUrl,
        title: original.title ? `${original.title} (copy)` : undefined,
        notes: original.notes ?? undefined,
        tags: original.tags.join(", "),
      },
      userId,
      workspaceId,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalLinksCreated: { increment: 1 } },
    });
    revalidatePath("/dashboard/links");

    return { success: true, message: "Link duplicated.", data: { id: link.id } };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to duplicate link." };
  }
}

export async function bulkDeleteLinksAction(ids: string[]): Promise<ActionResult> {
  if (!ids.length) return { success: false, message: "No links selected." };
  try {
    const { userId } = await getAuthContext();
    // Verify ownership for all IDs first
    const owned = await prisma.link.findMany({
      where: { id: { in: ids }, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    const ownedIds = owned.map((l) => l.id);
    if (!ownedIds.length) return { success: false, message: "No matching links found." };

    await prisma.link.deleteMany({ where: { id: { in: ownedIds } } });
    revalidatePath("/dashboard/links");
    return { success: true, message: `${ownedIds.length} link${ownedIds.length !== 1 ? "s" : ""} deleted.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete links." };
  }
}

export async function bulkToggleActiveAction(ids: string[], isActive: boolean): Promise<ActionResult> {
  if (!ids.length) return { success: false, message: "No links selected." };
  try {
    const { userId } = await getAuthContext();
    const owned = await prisma.link.findMany({
      where: { id: { in: ids }, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    const ownedIds = owned.map((l) => l.id);
    if (!ownedIds.length) return { success: false, message: "No matching links found." };

    await prisma.link.updateMany({ where: { id: { in: ownedIds } }, data: { isActive } });
    revalidatePath("/dashboard/links");
    return { success: true, message: `${ownedIds.length} link${ownedIds.length !== 1 ? "s" : ""} ${isActive ? "activated" : "deactivated"}.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to update links." };
  }
}
