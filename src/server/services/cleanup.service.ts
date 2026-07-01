import { prisma } from "@/server/db/prisma";

export async function deleteExpiredGuestLinks() {
  const result = await prisma.guestLink.deleteMany({
    where: {
      deleteAfter: {
        lt: new Date(),
      },
    },
  });

  return {
    deletedCount: result.count,
  };
}

export async function markGuestLinkExpired(guestLinkId: string) {
  return prisma.guestLink.update({
    where: {
      id: guestLinkId,
    },
    data: {
      isActive: false,
    },
  });
}
