import { prisma } from "@/server/db/prisma";

export async function getRecentLoginEvents(userId: string, limit = 10) {
  return prisma.loginEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
