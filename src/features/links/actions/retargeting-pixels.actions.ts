"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getUserPlan } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";

export type RetargetingPixel = { type: "meta" | "google" | "tiktok" | "linkedin"; id: string };

type Result = { success: true } | { error: string };

const PIXEL_TYPES = ["meta", "google", "tiktok", "linkedin"] as const;

const schema = z.object({
  linkId: z.string(),
  pixels: z.array(
    z.object({
      type: z.enum(PIXEL_TYPES),
      id: z.string().min(1, "Pixel ID cannot be empty").max(100),
    }),
  ),
});

export async function updateRetargetingPixelsAction(
  linkId: string,
  pixels: RetargetingPixel[],
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "Retargeting pixels require a Starter or Pro plan" };

  const maxPixels = PLAN_LIMITS[plan].retargetingPixels;
  if (pixels.length > maxPixels) {
    return { error: `Your plan supports up to ${maxPixels} pixel${maxPixels === 1 ? "" : "s"} per link` };
  }

  const parsed = schema.safeParse({ linkId, pixels });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { error: "Link not found" };

  await prisma.link.update({
    where: { id: linkId },
    data: { retargetingPixels: pixels.length ? pixels : Prisma.DbNull },
  });

  return { success: true };
}
