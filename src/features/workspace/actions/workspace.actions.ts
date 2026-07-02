"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { canCreateWorkspace, PLAN_LIMITS } from "@/lib/plans";
import { getWorkspaceMember, ACTIVE_WORKSPACE_COOKIE } from "@/server/queries/workspace.queries";
import { sendWorkspaceInviteEmail, sendVerificationEmail } from "@/lib/email";

// ─── Create / switch workspace ───────────────────────────────────────────────

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
});

export async function createWorkspaceAction(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const userId = session.user.id;
  const plan = await getUserPlan(userId);
  const ownedCount = await prisma.workspaceMember.count({ where: { userId, role: "OWNER" } });

  if (!canCreateWorkspace(plan, ownedCount)) {
    return {
      error:
        plan === "pro"
          ? `You've reached the ${PLAN_LIMITS.pro.workspaces}-workspace limit.`
          : "Upgrade to Pro to create additional workspaces.",
    };
  }

  const base = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "workspace";
  const slug = `${base}-${crypto.randomBytes(3).toString("hex")}`;

  const workspace = await prisma.workspace.create({
    data: { name: parsed.data.name, slug },
    select: { id: true },
  });
  await prisma.workspaceMember.create({
    data: { userId, workspaceId: workspace.id, role: "OWNER" },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/dashboard");
}

export async function setActiveWorkspaceAction(workspaceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const member = await getWorkspaceMember(session.user.id, workspaceId);
  if (!member) return { error: "Not a member of this workspace" };

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/dashboard");
}

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

// ─── Create member account directly (email + password, no invite link) ───────
// An alternative to the email-invite-link flow: the admin sets a password for
// the new member up front. The member signs in immediately with those
// credentials; verifying their email afterward is optional, same as normal
// registration. This bypasses proof that the admin controls the invited inbox,
// so it's a deliberate trust trade-off for teams who want to onboard people
// without waiting on an email round-trip.

const createMemberAccountSchema = z.object({
  workspaceId: z.string(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(64),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function createMemberAccountAction(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = createMemberAccountSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { error: "An account with this email already exists — use the invite-by-email option instead." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  // onboardingCompleted is set true here — this user is joining an existing
  // workspace, so they should never see the "set up your own workspace" wizard.
  // createdAsWorkspaceMember marks this account as existing solely for this
  // workspace, so removing them later can safely delete the whole account.
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: passwordHash,
      onboardingCompleted: true,
      createdAsWorkspaceMember: true,
    },
    select: { id: true },
  });

  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: parsed.data.workspaceId, role: "MEMBER" },
  });

  // Optional email verification — fire-and-forget, doesn't block sign-in.
  try {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    await sendVerificationEmail(email, token);
  } catch {
    // Non-critical — the account still works without it
  }

  revalidatePath("/dashboard/settings/workspace");
  return { success: true, email };
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

  const targetUser = await prisma.user.findUnique({
    where: { id: target.userId },
    select: {
      createdAsWorkspaceMember: true,
      _count: { select: { workspaces: true } },
    },
  });

  // Only delete the whole account when it was created purely for this workspace
  // (via "Create account manually") and doesn't belong to any other workspace —
  // otherwise we'd risk wiping an invited user's own unrelated data.
  const shouldDeleteAccount =
    targetUser?.createdAsWorkspaceMember && targetUser._count.workspaces === 1;

  if (shouldDeleteAccount) {
    await prisma.user.delete({ where: { id: target.userId } });
  } else {
    await prisma.workspaceMember.delete({ where: { id: memberId } });
  }

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Default link settings ────────────────────────────────────────────────────

const defaultsSchema = z.object({
  workspaceId: z.string(),
  slugStyle: z.enum(["incremental", "random", "secure"]),
  defaultRedirectType: z.enum(["301", "302", "307", "308"]),
  defaultCloakingEnabled: z.boolean(),
});

export async function updateWorkspaceDefaultsAction(data: {
  workspaceId: string;
  slugStyle: string;
  defaultRedirectType: string;
  defaultCloakingEnabled: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = defaultsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  await prisma.workspace.update({
    where: { id: parsed.data.workspaceId },
    data: {
      slugStyle: parsed.data.slugStyle,
      defaultRedirectType: parsed.data.defaultRedirectType,
      defaultCloakingEnabled: parsed.data.defaultCloakingEnabled,
    },
  });

  revalidatePath("/dashboard/settings/defaults");
  return { success: true };
}

// ─── Transfer ownership ──────────────────────────────────────────────────────

export async function transferOwnershipAction(memberId: string, workspaceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const requester = await getWorkspaceMember(session.user.id, workspaceId);
  if (!requester || requester.role !== "OWNER") return { error: "Only the owner can transfer ownership" };

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target || target.workspaceId !== workspaceId) return { error: "Member not found" };
  if (target.userId === session.user.id) return { error: "You already own this workspace" };

  await prisma.$transaction([
    prisma.workspaceMember.update({ where: { id: memberId }, data: { role: "OWNER" } }),
    prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
      data: { role: "ADMIN" },
    }),
  ]);

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

// ─── Pending invites ─────────────────────────────────────────────────────────

export async function resendInviteAction(workspaceId: string, email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const requester = await getWorkspaceMember(session.user.id, workspaceId);
  if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return { error: "Workspace not found" };

  const identifier = `invite:${workspaceId}:${email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  await sendWorkspaceInviteEmail(email, workspace.name, token, session.user.name ?? "Someone");

  revalidatePath("/dashboard/settings/workspace");
  return { success: true };
}

export async function revokeInviteAction(workspaceId: string, email: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const requester = await getWorkspaceMember(session.user.id, workspaceId);
  if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
    return { error: "Insufficient permissions" };
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: `invite:${workspaceId}:${email}` },
  });

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
