"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };
type TargetType = "User" | "Workspace";

function detailPath(targetType: TargetType, targetId: string) {
  return targetType === "User" ? `/admin/users/${targetId}` : `/admin/workspaces/${targetId}`;
}

export async function addNoteAction(
  targetType: TargetType,
  targetId: string,
  note: string,
): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    const trimmed = note.trim();
    if (!trimmed) return { success: false, message: "Note can't be empty." };

    await prisma.adminNote.create({
      data: { targetType, targetId, authorUserId: adminId, note: trimmed },
    });

    await logAdminAction(adminId, "note.add", { targetType, targetId });
    revalidatePath(detailPath(targetType, targetId));
    return { success: true, message: "Note added." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function resolveNoteAction(
  noteId: string,
  targetType: TargetType,
  targetId: string,
  resolved: boolean,
): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.adminNote.update({ where: { id: noteId }, data: { resolved } });

    await logAdminAction(adminId, resolved ? "note.resolve" : "note.reopen", { targetType, targetId });
    revalidatePath(detailPath(targetType, targetId));
    return { success: true, message: resolved ? "Marked resolved." : "Reopened." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteNoteAction(
  noteId: string,
  targetType: TargetType,
  targetId: string,
): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.adminNote.delete({ where: { id: noteId } });

    await logAdminAction(adminId, "note.delete", { targetType, targetId });
    revalidatePath(detailPath(targetType, targetId));
    return { success: true, message: "Note deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
