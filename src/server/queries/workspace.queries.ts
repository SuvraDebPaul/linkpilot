import { cookies } from "next/headers";
import { prisma } from "@/server/db/prisma";

export const ACTIVE_WORKSPACE_COOKIE = "active_workspace";

/**
 * Returns the ID of the user's active workspace: whichever workspace they last
 * switched to (via the active-workspace cookie), falling back to the first one
 * they joined if the cookie is missing, stale, or points to a workspace they're
 * no longer a member of.
 */
export async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieWorkspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  if (cookieWorkspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: cookieWorkspaceId } },
      select: { workspaceId: true },
    });
    if (membership) return membership.workspaceId;
  }

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
  const existing = await getActiveWorkspaceId(userId);
  if (existing) return existing;

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
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, createdAsWorkspaceMember: true },
          },
        },
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

export async function getWorkspaceDefaults(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      slugStyle: true,
      defaultRedirectType: true,
      defaultCloakingEnabled: true,
      defaultQrFgColor: true,
      defaultQrBgColor: true,
      defaultQrEcLevel: true,
    },
  });
}

/** Pending workspace invites are stored as VerificationToken rows with identifier "invite:<workspaceId>:<email>". */
export async function getPendingInvites(workspaceId: string) {
  const tokens = await prisma.verificationToken.findMany({
    where: { identifier: { startsWith: `invite:${workspaceId}:` } },
  });

  return tokens.map((t) => ({
    email: t.identifier.slice(`invite:${workspaceId}:`.length),
    expires: t.expires,
  }));
}

export async function getWorkspaceAuditLog(workspaceId: string, limit = 20) {
  return prisma.workspaceAuditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, message: true, createdAt: true },
  });
}
