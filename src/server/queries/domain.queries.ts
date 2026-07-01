import { prisma } from "@/server/db/prisma";

export async function getVerifiedDomainsForWorkspace(workspaceId: string) {
  return prisma.customDomain.findMany({
    where: { workspaceId, status: "VERIFIED" },
    orderBy: { domain: "asc" },
    select: { id: true, domain: true },
  });
}
