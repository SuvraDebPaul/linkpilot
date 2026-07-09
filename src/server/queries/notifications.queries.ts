import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plans";
import { getPendingInvites } from "@/server/queries/workspace.queries";

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "mail" | "globe" | "users" | "gauge" | "user-plus" | "link";
  severity: "info" | "warning";
};

const SEVEN_DAYS_AGO = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const SEVEN_DAYS_FROM_NOW = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export async function getActionItems(userId: string, workspaceId: string): Promise<ActionItem[]> {
  const items: ActionItem[] = [];

  const [user, membership, plan, linkCount, campaignCount, expiringSoonCount, domains] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } }),
    prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      select: { role: true },
    }),
    getUserPlan(userId),
    prisma.link.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
    prisma.link.count({
      where: { workspaceId, isActive: true, expiresAt: { gt: new Date(), lte: SEVEN_DAYS_FROM_NOW() } },
    }),
    prisma.customDomain.findMany({
      where: { workspaceId, status: { in: ["PENDING", "FAILED"] } },
      select: { id: true, domain: true, status: true },
    }),
  ]);

  const isOwnerOrAdmin = membership?.role === "OWNER" || membership?.role === "ADMIN";

  if (user && !user.emailVerified) {
    items.push({
      id: "email-unverified",
      title: "Verify your email",
      description: "Confirm your email address to secure your account.",
      href: "/dashboard/settings",
      icon: "mail",
      severity: "warning",
    });
  }

  if (expiringSoonCount > 0) {
    items.push({
      id: "links-expiring",
      title: `${expiringSoonCount} link${expiringSoonCount !== 1 ? "s" : ""} expiring soon`,
      description: "These links expire within the next 7 days.",
      href: "/dashboard/links",
      icon: "link",
      severity: "warning",
    });
  }

  const linkLimit = PLAN_LIMITS[plan].links;
  if (linkLimit !== Infinity && linkCount / linkLimit >= 0.8) {
    items.push({
      id: "links-limit",
      title: `${linkCount}/${linkLimit} links used`,
      description: "You're approaching your plan's link limit. Upgrade for more room.",
      href: "/dashboard/settings/billing",
      icon: "gauge",
      severity: "warning",
    });
  }

  const campaignLimit = PLAN_LIMITS[plan].campaigns;
  if (campaignLimit !== Infinity && campaignCount / campaignLimit >= 0.8) {
    items.push({
      id: "campaigns-limit",
      title: `${campaignCount}/${campaignLimit} campaigns used`,
      description: "You're approaching your plan's campaign limit. Upgrade for more room.",
      href: "/dashboard/settings/billing",
      icon: "gauge",
      severity: "warning",
    });
  }

  if (isOwnerOrAdmin) {
    for (const domain of domains) {
      items.push({
        id: `domain-${domain.id}`,
        title: domain.status === "FAILED" ? `${domain.domain} verification failed` : `${domain.domain} awaiting verification`,
        description:
          domain.status === "FAILED"
            ? "The CNAME record couldn't be found. Double-check your DNS settings."
            : "Add the CNAME record and verify to activate this domain.",
        href: "/dashboard/settings/domains",
        icon: "globe",
        severity: domain.status === "FAILED" ? "warning" : "info",
      });
    }

    const pendingInvites = await getPendingInvites(workspaceId);
    if (pendingInvites.length > 0) {
      items.push({
        id: "pending-invites",
        title: `${pendingInvites.length} pending invite${pendingInvites.length !== 1 ? "s" : ""}`,
        description: "Waiting for team members to accept their invitation.",
        href: "/dashboard/settings/workspace",
        icon: "users",
        severity: "info",
      });
    }

    const recentMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId, userId: { not: userId }, joinedAt: { gte: SEVEN_DAYS_AGO() } },
      select: { user: { select: { name: true, email: true } } },
      orderBy: { joinedAt: "desc" },
    });
    for (const [i, m] of recentMembers.entries()) {
      items.push({
        id: `new-member-${i}`,
        title: `${m.user.name ?? m.user.email} joined the workspace`,
        description: "New team member added in the last 7 days.",
        href: "/dashboard/settings/workspace",
        icon: "user-plus",
        severity: "info",
      });
    }
  }

  return items;
}
