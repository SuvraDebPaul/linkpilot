"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

export async function suspendWorkspaceAction(workspaceId: string, suspend: boolean): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { suspended: suspend, suspendedAt: suspend ? new Date() : null },
    });

    await logAdminAction(adminId, suspend ? "workspace.suspend" : "workspace.unsuspend", {
      targetType: "Workspace",
      targetId: workspaceId,
    });
    revalidatePath(`/admin/workspaces/${workspaceId}`);
    revalidatePath("/admin/workspaces");
    return { success: true, message: suspend ? "Workspace suspended." : "Workspace unsuspended." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function forceTransferOwnershipAction(
  workspaceId: string,
  newOwnerUserId: string,
): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    const newOwnerMembership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: newOwnerUserId, workspaceId } },
      select: { id: true },
    });
    if (!newOwnerMembership) {
      return { success: false, message: "That user isn't a member of this workspace." };
    }

    await prisma.$transaction([
      prisma.workspaceMember.updateMany({
        where: { workspaceId, role: "OWNER" },
        data: { role: "ADMIN" },
      }),
      prisma.workspaceMember.update({
        where: { id: newOwnerMembership.id },
        data: { role: "OWNER" },
      }),
    ]);

    await logAdminAction(adminId, "workspace.transfer_ownership", {
      targetType: "Workspace",
      targetId: workspaceId,
      metadata: { newOwnerUserId },
    });
    revalidatePath(`/admin/workspaces/${workspaceId}`);
    return { success: true, message: "Ownership transferred." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function forceDeleteWorkspaceAction(workspaceId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } });
    if (!workspace) return { success: false, message: "Workspace not found." };

    await prisma.workspace.delete({ where: { id: workspaceId } });

    await logAdminAction(adminId, "workspace.delete", {
      targetType: "Workspace",
      targetId: workspaceId,
      metadata: { name: workspace.name },
    });
    revalidatePath("/admin/workspaces");
    return { success: true, message: "Workspace deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
