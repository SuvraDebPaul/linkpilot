"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

export async function createFeatureFlagAction(key: string, description: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    const trimmedKey = key.trim();
    if (!trimmedKey) return { success: false, message: "Key is required." };

    const existing = await prisma.featureFlag.findUnique({ where: { key: trimmedKey } });
    if (existing) return { success: false, message: "A flag with that key already exists." };

    await prisma.featureFlag.create({
      data: { key: trimmedKey, description: description.trim() || null, enabled: false },
    });

    await logAdminAction(adminId, "flag.create", { targetType: "FeatureFlag", targetId: trimmedKey });
    revalidatePath("/admin/system/flags");
    return { success: true, message: "Flag created." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function toggleFeatureFlagAction(key: string, enabled: boolean): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.featureFlag.update({ where: { key }, data: { enabled } });

    await logAdminAction(adminId, enabled ? "flag.enable" : "flag.disable", {
      targetType: "FeatureFlag",
      targetId: key,
    });
    revalidatePath("/admin/system/flags");
    return { success: true, message: `${key} ${enabled ? "enabled" : "disabled"}.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteFeatureFlagAction(key: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.featureFlag.delete({ where: { key } });

    await logAdminAction(adminId, "flag.delete", { targetType: "FeatureFlag", targetId: key });
    revalidatePath("/admin/system/flags");
    return { success: true, message: "Flag deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
