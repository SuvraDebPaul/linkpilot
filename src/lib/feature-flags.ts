import { prisma } from "@/server/db/prisma";

// Simple on/off switches an admin can flip without a deploy (see
// FeatureFlag in schema.prisma). No row for a key means "not configured yet"
// — the caller supplies what that should mean for its own feature via
// defaultValue, since "missing" means different things for different flags
// (e.g. signups should stay enabled by default, maintenance mode should not).
export async function isFeatureEnabled(key: string, defaultValue = false): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { key }, select: { enabled: true } });
  return flag?.enabled ?? defaultValue;
}
