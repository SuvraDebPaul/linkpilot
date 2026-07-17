import { prisma } from "@/server/db/prisma";

// Simple string key/value config an admin can edit without a deploy (see
// SiteSetting in schema.prisma). No row for a key means "not configured" —
// the caller supplies what that means for its own use via defaultValue.
export async function getSiteSetting(key: string, defaultValue = ""): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({ where: { key }, select: { value: true } });
  return setting?.value ?? defaultValue;
}
