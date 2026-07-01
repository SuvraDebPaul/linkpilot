"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, canCreateCampaign, PLAN_LIMITS, getUserUsage } from "@/lib/subscription";
import { checkCampaignRateLimit } from "@/lib/rate-limit";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "@/features/campaigns/schemas/campaign.schema";

type Result = { success: boolean; message: string; data?: { id: string } };

async function getAuthContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  let membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    const base = user?.email?.split("@")[0] ?? userId.slice(0, 8);
    const slug = `${base}-${userId.slice(-6)}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const workspace = await prisma.workspace.create({
      data: { name: `${user?.name ?? "My"} Workspace`, slug },
      select: { id: true },
    });
    await prisma.workspaceMember.create({
      data: { userId, workspaceId: workspace.id, role: "OWNER" },
    });
    membership = { workspaceId: workspace.id };
  }

  return { userId, workspaceId: membership.workspaceId };
}

export async function createCampaignAction(input: unknown): Promise<Result> {
  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    const { userId, workspaceId } = await getAuthContext();

    // Burst rate limit (10 campaigns per hour)
    const withinRateLimit = await checkCampaignRateLimit(userId);
    if (!withinRateLimit) {
      return { success: false, message: "Too many campaigns created recently. Please wait before creating another." };
    }

    // Enforce plan limits
    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].campaigns;
    if (isFinite(limit)) {
      const count = plan === "free"
        ? (await getUserUsage(userId)).campaignsCreated
        : await prisma.campaign.count({ where: { workspaceId } });
      if (!canCreateCampaign(plan, count)) {
        return {
          success: false,
          message: plan === "free"
            ? `You've used your ${limit}-campaign free allowance. Upgrade to create more campaigns.`
            : `You've reached the ${limit}-campaign limit. Upgrade to Pro for unlimited campaigns.`,
        };
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        workspaceId,
        name: parsed.data.name,
        description: parsed.data.description?.trim() || null,
      },
    });
    // Increment lifetime counter
    await prisma.user.update({
      where: { id: userId },
      data: { totalCampaignsCreated: { increment: 1 } },
    });

    revalidatePath("/dashboard/campaigns");
    return { success: true, message: "Campaign created.", data: { id: campaign.id } };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function updateCampaignAction(id: string, input: unknown): Promise<Result> {
  const parsed = updateCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    const { userId } = await getAuthContext();
    const existing = await prisma.campaign.findFirst({
      where: { id, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    if (!existing) return { success: false, message: "Campaign not found." };
    await prisma.campaign.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        description: parsed.data.description?.trim() || null,
      },
    });
    revalidatePath("/dashboard/campaigns");
    revalidatePath(`/dashboard/campaigns/${id}`);
    return { success: true, message: "Campaign updated." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function deleteCampaignAction(id: string): Promise<Result> {
  try {
    const { userId } = await getAuthContext();
    const existing = await prisma.campaign.findFirst({
      where: { id, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    if (!existing) return { success: false, message: "Campaign not found." };
    // Unlink links (set campaignId null) then delete
    await prisma.link.updateMany({ where: { campaignId: id }, data: { campaignId: null } });
    await prisma.campaign.delete({ where: { id } });
    revalidatePath("/dashboard/campaigns");
    return { success: true, message: "Campaign deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function updateReportEmailScheduleAction(
  campaignId: string,
  data: { enabled: boolean; frequency: "weekly" | "monthly"; recipients: string[] },
): Promise<Result> {
  try {
    const { userId } = await getAuthContext();

    // Require Starter or Pro
    const plan = await getUserPlan(userId);
    if (plan === "free") {
      return { success: false, message: "Scheduled report emails require a Starter or Pro plan." };
    }

    const existing = await prisma.campaign.findFirst({
      where: { id: campaignId, workspace: { members: { some: { userId } } } },
      select: { id: true, shareToken: true },
    });
    if (!existing) return { success: false, message: "Campaign not found." };
    if (!existing.shareToken) {
      return { success: false, message: "Enable report sharing on this campaign before scheduling emails." };
    }

    const validEmails = data.recipients.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (data.enabled && validEmails.length === 0) {
      return { success: false, message: "Add at least one recipient email address." };
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        reportEmailEnabled: data.enabled,
        reportEmailFrequency: data.enabled ? data.frequency : null,
        reportEmailRecipients: data.enabled ? validEmails : [],
      },
    });

    revalidatePath(`/dashboard/campaigns/${campaignId}`);
    return { success: true, message: data.enabled ? "Report emails scheduled." : "Report emails disabled." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function assignLinkToCampaignAction(linkId: string, campaignId: string | null): Promise<Result> {
  try {
    const { userId } = await getAuthContext();
    const link = await prisma.link.findFirst({
      where: { id: linkId, workspace: { members: { some: { userId } } } },
      select: { id: true },
    });
    if (!link) return { success: false, message: "Link not found." };
    await prisma.link.update({ where: { id: linkId }, data: { campaignId } });
    revalidatePath("/dashboard/campaigns");
    revalidatePath("/dashboard/links");
    return { success: true, message: "Link updated." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Failed." };
  }
}
