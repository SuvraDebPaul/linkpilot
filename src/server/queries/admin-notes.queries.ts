import { prisma } from "@/server/db/prisma";

export async function getNotes(targetType: "User" | "Workspace", targetId: string) {
  const notes = await prisma.adminNote.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "desc" },
  });

  // authorUserId is a plain reference (no FK — see the model's own comment),
  // so author emails need a separate lookup, same pattern as the audit log's.
  const authorIds = [...new Set(notes.map((n) => n.authorUserId).filter((id): id is string => !!id))];
  const authors = authorIds.length
    ? await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, email: true } })
    : [];
  const emailById = new Map(authors.map((a) => [a.id, a.email]));

  return notes.map((n) => ({
    ...n,
    authorEmail: n.authorUserId ? (emailById.get(n.authorUserId) ?? "(deleted account)") : null,
  }));
}
