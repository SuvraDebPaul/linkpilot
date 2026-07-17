import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/prisma";

// Every mutating action taken from the super-admin panel must call this — it's
// the entire accountability trail for a role with no other guardrails. Fire
// this synchronously (await it) alongside the action itself, not as a
// best-effort side log, since a missing audit entry is itself the bug here.
export async function logAdminAction(
  actorUserId: string,
  action: string,
  options?: {
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await prisma.adminAuditLog.create({
    data: {
      actorUserId,
      action,
      targetType: options?.targetType,
      targetId: options?.targetId,
      metadata: options?.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
