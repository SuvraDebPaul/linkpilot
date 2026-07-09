"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

type Result = { success: boolean; message: string };

export async function revokeAllSessionsAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { sessionVersion: { increment: 1 } },
  });

  return { success: true, message: "All sessions revoked. You'll need to sign in again." };
}
