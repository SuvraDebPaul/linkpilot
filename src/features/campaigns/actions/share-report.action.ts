"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import crypto from "crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import { prisma } from "@/server/db/prisma";

type Result = { success: boolean; message: string; token?: string };

export async function enableShareReportAction(campaignId: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const plan = await getUserPlan(session.user.id);
  if (plan !== "pro") {
    return { success: false, message: "Shareable reports require the Pro plan." };
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true, shareToken: true },
  });
  if (!campaign) return { success: false, message: "Campaign not found" };

  if (campaign.shareToken) {
    return { success: true, message: "Share link already active.", token: campaign.shareToken };
  }

  const token = crypto.randomBytes(24).toString("hex");
  await prisma.campaign.update({ where: { id: campaignId }, data: { shareToken: token } });
  revalidatePath(`/dashboard/campaigns/${campaignId}/report`);
  return { success: true, message: "Share link created.", token };
}

export async function disableShareReportAction(campaignId: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  await prisma.campaign.updateMany({
    where: { id: campaignId, workspace: { members: { some: { userId: session.user.id } } } },
    data: { shareToken: null },
  });
  revalidatePath(`/dashboard/campaigns/${campaignId}/report`);
  return { success: true, message: "Share link revoked." };
}
