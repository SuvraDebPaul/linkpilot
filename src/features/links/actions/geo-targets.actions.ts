"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { enforceDemoRedirect } from "@/server/services/demo-guard.service";

export type GeoTarget = { country: string; url: string };

type Result = { success: true } | { error: string };

const schema = z.object({
  linkId: z.string(),
  targets: z.array(
    z.object({
      country: z.string().length(2, "Must be a 2-letter country code"),
      url: z.string().url("Must be a valid URL"),
    }),
  ),
});

export async function updateGeoTargetsAction(
  linkId: string,
  targets: GeoTarget[],
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "Geo targeting requires a Starter or Pro plan" };

  const parsed = schema.safeParse({ linkId, targets });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  // Verify the link belongs to this user's workspace
  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { error: "Link not found" };

  const safeTargets = await Promise.all(
    targets.map(async (t) => ({ ...t, url: await enforceDemoRedirect(session.user.id, t.url) })),
  );

  await prisma.link.update({
    where: { id: linkId },
    data: { geoTargets: safeTargets },
  });

  return { success: true };
}
