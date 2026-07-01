import { prisma } from "@/server/db/prisma";

export async function getGuestLinkBySlug(slug: string) {
  return prisma.guestLink.findUnique({
    where: {
      shortCode: slug,
    },
  });
}
