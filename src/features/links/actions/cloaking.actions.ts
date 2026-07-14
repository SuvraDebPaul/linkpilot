"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";

type Result = { success: true } | { error: string };

export async function updateCloakingAction(
  linkId: string,
  opts: { isCloaked: boolean; hideReferrer: boolean },
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: SESSION_EXPIRED_MESSAGE };

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "Link cloaking requires a Starter or Pro plan" };

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { error: "Link not found" };

  await prisma.link.update({
    where: { id: linkId },
    data: { isCloaked: opts.isCloaked, hideReferrer: opts.hideReferrer },
  });

  revalidatePath(`/dashboard/links/${linkId}`);
  return { success: true };
}
