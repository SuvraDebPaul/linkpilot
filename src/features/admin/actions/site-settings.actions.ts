"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

export async function upsertSiteSettingAction(key: string, value: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    const trimmedKey = key.trim();
    if (!trimmedKey) return { success: false, message: "Key is required." };

    await prisma.siteSetting.upsert({
      where: { key: trimmedKey },
      create: { key: trimmedKey, value },
      update: { value },
    });

    await logAdminAction(adminId, "setting.update", { targetType: "SiteSetting", targetId: trimmedKey });
    revalidatePath("/admin/config");
    revalidatePath("/", "layout");
    return { success: true, message: `${trimmedKey} saved.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteSiteSettingAction(key: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    await prisma.siteSetting.delete({ where: { key } });

    await logAdminAction(adminId, "setting.delete", { targetType: "SiteSetting", targetId: key });
    revalidatePath("/admin/config");
    revalidatePath("/", "layout");
    return { success: true, message: `${key} removed.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
