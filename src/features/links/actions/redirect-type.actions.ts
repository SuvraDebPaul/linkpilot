"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, PLAN_LIMITS } from "@/lib/subscription";

type Result = { success: true; message: string } | { success: false; message: string };

const VALID_TYPES = ["301", "302", "307"] as const;
type RedirectType = (typeof VALID_TYPES)[number];

export async function updateRedirectTypeAction(
  linkId: string,
  redirectType: RedirectType,
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized." };

  if (!VALID_TYPES.includes(redirectType)) {
    return { success: false, message: "Invalid redirect type." };
  }

  const plan = await getUserPlan(session.user.id);
  if (!PLAN_LIMITS[plan].customRedirectType && redirectType !== "302") {
    return { success: false, message: "Custom redirect types require Starter or Pro." };
  }

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { success: false, message: "Link not found." };

  await prisma.link.update({ where: { id: linkId }, data: { redirectType } });
  revalidatePath(`/dashboard/links/${linkId}`);

  return { success: true, message: "Redirect type updated." };
}
