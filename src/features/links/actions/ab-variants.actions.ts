"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getUserPlan } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";

export type AbVariant = { url: string; weight: number };

type Result = { success: true } | { error: string };

const schema = z.object({
  linkId: z.string(),
  variants: z.array(
    z.object({
      url: z.string().url("Each variant must be a valid URL"),
      weight: z.number().min(1).max(99),
    }),
  ),
});

export async function updateAbVariantsAction(
  linkId: string,
  variants: AbVariant[],
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "A/B testing requires a Starter or Pro plan" };

  const maxVariants = PLAN_LIMITS[plan].abVariants;
  if (variants.length > maxVariants) {
    return { error: `Your plan supports up to ${maxVariants} variants` };
  }

  if (variants.length > 0) {
    const total = variants.reduce((s, v) => s + v.weight, 0);
    if (Math.round(total) !== 100) {
      return { error: `Weights must sum to 100 (currently ${total})` };
    }
  }

  const parsed = schema.safeParse({ linkId, variants });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { error: "Link not found" };

  await prisma.link.update({
    where: { id: linkId },
    data: { abVariants: variants.length ? variants : Prisma.DbNull },
  });

  return { success: true };
}
