"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { z } from "zod/v4";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getWorkspaceMember } from "@/server/queries/workspace.queries";
import { sendWorkspaceInviteEmail } from "@/lib/email";

// ─── Update workspace branding ───────────────────────────────────────────────

const brandingSchema = z.object({
  workspaceId: z.string(),
  brandLogoUrl: z.string().trim().url("Must be a valid URL").max(500).or(z.literal("")).optional(),
  brandColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color e.g. #0d9488").or(z.literal("")).optional(),
  hideBranding: z.boolean().optional(),
});

export async function updateWorkspaceBrandingAction(data: {
  workspaceId: string;
  brandLogoUrl: string;
  brandColor: string;
  hideBranding: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = brandingSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  await prisma.workspace.update({
    where: { id: parsed.data.workspaceId },
    data: {
      brandLogoUrl: parsed.data.brandLogoUrl || null,
      brandColor: parsed.data.brandColor || null,
      hideBranding: parsed.data.hideBranding ?? false,
    },
  });

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Rename workspace ────────────────────────────────────────────────────────

const renameSchema = z.object({
  workspaceId: z.string(),
  name: z.string().trim().min(1).max(60),
});

export async function renameWorkspaceAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = renameSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  await prisma.workspace.update({
    where: { id: parsed.data.workspaceId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Invite member ───────────────────────────────────────────────────────────

const inviteSchema = z.object({
  workspaceId: z.string(),
  email: z.email(),
});

export async function inviteMemberAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = inviteSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email" };

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: parsed.data.workspaceId } });
  if (!workspace) return { error: "Workspace not found" };

  // Check if already a member
  const invitee = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (invitee) {
    const existing = await getWorkspaceMember(invitee.id, parsed.data.workspaceId);
    if (existing) return { error: "This user is already a member" };
  }

  // Create or reuse invite token
  const identifier = `invite:${parsed.data.workspaceId}:${parsed.data.email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  await sendWorkspaceInviteEmail(parsed.data.email, workspace.name, token, session.user.name ?? "Someone");

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Change member role ──────────────────────────────────────────────────────

export async function changeMemberRoleAction(memberId: string, workspaceId: string, role: "ADMIN" | "MEMBER") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const requester = await getWorkspaceMember(session.user.id, workspaceId);
  if (!requester || requester.role !== "OWNER") return { error: "Only owners can change roles" };

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target || target.workspaceId !== workspaceId) return { error: "Member not found" };
  if (target.userId === session.user.id) return { error: "Cannot change your own role" };
  if (target.role === "OWNER") return { error: "Cannot change owner role" };

  await prisma.workspaceMember.update({ where: { id: memberId }, data: { role } });
  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Remove member ───────────────────────────────────────────────────────────

export async function removeMemberAction(memberId: string, workspaceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const requester = await getWorkspaceMember(session.user.id, workspaceId);
  if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target || target.workspaceId !== workspaceId) return { error: "Member not found" };
  if (target.role === "OWNER") return { error: "Cannot remove the owner" };
  if (target.userId === session.user.id) return { error: "Use Leave Workspace to remove yourself" };

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Leave workspace ─────────────────────────────────────────────────────────

export async function leaveWorkspaceAction(workspaceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const member = await getWorkspaceMember(session.user.id, workspaceId);
  if (!member) return { error: "Not a member" };
  if (member.role === "OWNER") return { error: "Transfer ownership before leaving" };

  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  revalidatePath("/dashboard");
  return { success: true };
}
