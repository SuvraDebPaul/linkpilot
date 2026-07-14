"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getWorkspaceMember } from "@/server/queries/workspace.queries";
import {
  createGeoTemplateSchema,
  createCampaignTemplateSchema,
} from "@/features/templates/schemas/templates.schema";

type Result = { success: boolean; message: string };

export async function createGeoTemplateAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const parsed = createGeoTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member) return { success: false, message: "Not a member of this workspace" };

  await prisma.geoTemplate.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      targets: parsed.data.targets,
    },
  });

  revalidatePath("/dashboard/settings/templates");
  return { success: true, message: "Geo template created." };
}

export async function deleteGeoTemplateAction(id: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const template = await prisma.geoTemplate.findUnique({ where: { id }, select: { workspaceId: true } });
  if (!template) return { success: false, message: "Template not found." };

  const member = await getWorkspaceMember(session.user.id, template.workspaceId);
  if (!member) return { success: false, message: "Not a member of this workspace" };

  await prisma.geoTemplate.delete({ where: { id } });
  revalidatePath("/dashboard/settings/templates");
  return { success: true, message: "Geo template deleted." };
}

export async function createCampaignTemplateAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const parsed = createCampaignTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const member = await getWorkspaceMember(session.user.id, parsed.data.workspaceId);
  if (!member) return { success: false, message: "Not a member of this workspace" };

  await prisma.campaignTemplate.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      source: parsed.data.source || null,
      medium: parsed.data.medium || null,
      campaign: parsed.data.campaign || null,
      term: parsed.data.term || null,
      content: parsed.data.content || null,
    },
  });

  revalidatePath("/dashboard/settings/templates");
  return { success: true, message: "Campaign template created." };
}

export async function deleteCampaignTemplateAction(id: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const template = await prisma.campaignTemplate.findUnique({ where: { id }, select: { workspaceId: true } });
  if (!template) return { success: false, message: "Template not found." };

  const member = await getWorkspaceMember(session.user.id, template.workspaceId);
  if (!member) return { success: false, message: "Not a member of this workspace" };

  await prisma.campaignTemplate.delete({ where: { id } });
  revalidatePath("/dashboard/settings/templates");
  return { success: true, message: "Campaign template deleted." };
}
