"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import crypto from "crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { canAddClientPortal } from "@/lib/plans";
import { countClientAccessForWorkspace } from "@/server/queries/client-access.queries";
import { sendClientPortalInviteEmail } from "@/lib/email";

type Result = { success: true } | { error: string };

const createSchema = z.object({
  workspaceId: z.string().min(1),
  clientName: z.string().trim().max(100).optional(),
  clientEmail: z.string().trim().email("Invalid email address"),
  campaignIds: z.array(z.string()).min(1, "Select at least one campaign"),
  sendInvite: z.boolean().optional(),
});

export async function createClientAccessAction(
  data: z.infer<typeof createSchema>,
): Promise<Result & { token?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: SESSION_EXPIRED_MESSAGE };

  const parsed = createSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { workspaceId, clientName, clientEmail, campaignIds, sendInvite } = parsed.data;

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "Client portals require a Starter or Pro plan" };

  const count = await countClientAccessForWorkspace(workspaceId);
  if (!canAddClientPortal(plan, count)) {
    return { error: "You've reached your client portal limit. Upgrade to Pro for unlimited portals." };
  }

  // Verify campaigns belong to this workspace
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: campaignIds }, workspaceId },
    select: { id: true },
  });
  if (campaigns.length === 0) return { error: "No valid campaigns selected" };

  const access = await prisma.clientAccess.create({
    data: {
      token: crypto.randomBytes(24).toString("hex"),
      clientName,
      clientEmail,
      createdByUserId: session.user.id,
      workspaceId,
      campaigns: {
        create: campaigns.map((c) => ({ campaignId: c.id })),
      },
    },
  });

  if (sendInvite) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, brandLogoUrl: true, brandColor: true },
    });
    await sendClientPortalInviteEmail({
      to: clientEmail,
      clientName: clientName ?? clientEmail,
      workspaceName: workspace?.name ?? "Your agency",
      portalUrl: `${process.env.NEXTAUTH_URL}/portal/${access.token}`,
      brandLogoUrl: workspace?.brandLogoUrl,
      brandColor: workspace?.brandColor,
    }).catch((err) => console.error("[client-invite] email failed:", err));
  }

  revalidatePath("/dashboard/clients");
  return { success: true, token: access.token };
}

export async function deleteClientAccessAction(
  clientAccessId: string,
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: SESSION_EXPIRED_MESSAGE };

  const access = await prisma.clientAccess.findFirst({
    where: { id: clientAccessId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!access) return { error: "Not found" };

  await prisma.clientAccess.delete({ where: { id: clientAccessId } });
  revalidatePath("/dashboard/clients");
  return { success: true };
}
