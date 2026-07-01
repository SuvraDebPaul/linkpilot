"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, PLAN_LIMITS } from "@/lib/subscription";

type Result = { success: true; message: string } | { success: false; message: string; fieldErrors?: Record<string, string[]> };

const ogSchema = z.object({
  ogTitle:       z.string().trim().max(120).optional().or(z.literal("")),
  ogDescription: z.string().trim().max(300).optional().or(z.literal("")),
  ogImage:       z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function updateOgTagsAction(
  linkId: string,
  input: unknown,
): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized." };

  const parsed = ogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const plan = await getUserPlan(session.user.id);
  if (!PLAN_LIMITS[plan].ogTags) {
    return { success: false, message: "Social OG tags require the Pro plan." };
  }

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { success: false, message: "Link not found." };

  await prisma.link.update({
    where: { id: linkId },
    data: {
      ogTitle:       parsed.data.ogTitle       || null,
      ogDescription: parsed.data.ogDescription || null,
      ogImage:       parsed.data.ogImage       || null,
    },
  });
  revalidatePath(`/dashboard/links/${linkId}`);

  return { success: true, message: "Social preview updated." };
}
