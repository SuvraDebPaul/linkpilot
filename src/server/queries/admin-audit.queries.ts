import { prisma } from "@/server/db/prisma";

const PAGE_SIZE = 50;

export async function getAdminAuditLog(filters: { action?: string; targetType?: string }, page = 1) {
  const where = {
    ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" as const } } : {}),
    ...(filters.targetType ? { targetType: filters.targetType } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  // actorUserId is a plain string reference (no FK — see the model's own
  // comment), so actor names/emails need a separate lookup rather than an
  // include, and must tolerate an actor whose account was later deleted.
  const actorIds = [...new Set(logs.map((l) => l.actorUserId).filter((id): id is string => !!id))];
  const actors = actorIds.length
    ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, email: true } })
    : [];
  const actorEmailById = new Map(actors.map((a) => [a.id, a.email]));

  return {
    logs: logs.map((l) => ({ ...l, actorEmail: l.actorUserId ? (actorEmailById.get(l.actorUserId) ?? "(deleted account)") : null })),
    total,
    pageSize: PAGE_SIZE,
  };
}
