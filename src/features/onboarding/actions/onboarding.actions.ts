"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { ensureWorkspace } from "@/server/queries/workspace.queries";

const schema = z.object({
  workspaceName: z.string().min(1).max(60).trim(),
  brandLogoUrl:  z.string().url().optional().or(z.literal("")),
  brandColor:    z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
});

type Result = { success: true } | { success: false; message: string };

export async function completeOnboardingAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Please check your input." };

  const { workspaceName, brandLogoUrl, brandColor } = parsed.data;
  const userId = session.user.id;

  const workspaceId = await ensureWorkspace(userId);

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: workspaceName,
      ...(brandLogoUrl ? { brandLogoUrl } : {}),
      ...(brandColor   ? { brandColor }   : {}),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });

  return { success: true };
}
