import { prisma } from "@/server/db/prisma";

/** Returns the ID of the user's active workspace (first joined). */
export async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
    orderBy: { joinedAt: "asc" },
  });
  return membership?.workspaceId ?? null;
}

/**
 * Returns the user's active workspace ID, creating a personal workspace on the
 * fly if none exists. Use this in page server components instead of
 * getActiveWorkspaceId to avoid a redirect loop for OAuth users whose workspace
 * creation event may not have completed before their first dashboard load.
 */
export async function ensureWorkspace(userId: string): Promise<string> {
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
    orderBy: { joinedAt: "asc" },
  });
  if (existing) return existing.workspaceId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  const base = user?.email?.split("@")[0] ?? userId.slice(0, 8);
  const rawSlug = `${base}-${userId.slice(-6)}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  // Avoid unique constraint failures by appending a short timestamp suffix if needed
  const slug = `${rawSlug}-${Date.now().toString(36)}`;
  const workspace = await prisma.workspace.create({
    data: { name: `${user?.name ?? "My"} Workspace`, slug },
    select: { id: true },
  });
  await prisma.workspaceMember.create({
    data: { userId, workspaceId: workspace.id, role: "OWNER" },
  });
  return workspace.id;
}

export async function getUserWorkspaces(userId: string) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, links: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

export async function getWorkspaceWithMembers(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

export async function getWorkspaceMember(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}
