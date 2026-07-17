"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

export async function addBlockedDomainAction(domain: string, reason: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!normalized) return { success: false, message: "Domain is required." };

    const existing = await prisma.blockedDomain.findUnique({ where: { domain: normalized } });
    if (existing) return { success: false, message: "That domain is already blocked." };

    await prisma.blockedDomain.create({
      data: { domain: normalized, reason: reason.trim() || null, createdBy: adminId },
    });

    await logAdminAction(adminId, "blocklist.add", { targetType: "BlockedDomain", targetId: normalized });
    revalidatePath("/admin/moderation/blocklist");
    return { success: true, message: `${normalized} is now blocked.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function removeBlockedDomainAction(domain: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.blockedDomain.delete({ where: { domain } });

    await logAdminAction(adminId, "blocklist.remove", { targetType: "BlockedDomain", targetId: domain });
    revalidatePath("/admin/moderation/blocklist");
    return { success: true, message: `${domain} removed from the blocklist.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function toggleLinkActiveAction(linkId: string, isActive: boolean): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.link.update({ where: { id: linkId }, data: { isActive } });

    await logAdminAction(adminId, isActive ? "link.enable" : "link.disable", {
      targetType: "Link",
      targetId: linkId,
    });
    revalidatePath("/admin/moderation/links");
    return { success: true, message: isActive ? "Link enabled." : "Link disabled." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
