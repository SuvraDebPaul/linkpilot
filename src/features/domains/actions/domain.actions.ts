"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod/v4";
import dns from "dns/promises";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { canAddDomain } from "@/lib/plans";
import { getUserWorkspaces } from "@/server/queries/workspace.queries";

const domainSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/, "Invalid domain format"),
});

export async function addDomainAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const plan = await getUserPlan(session.user.id);
  if (plan === "free") return { error: "Custom domains require a Starter or Pro plan" };

  const parsed = domainSchema.safeParse({ domain: formData.get("domain") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid domain" };

  const memberships = await getUserWorkspaces(session.user.id);
  if (!memberships.length) return { error: "No workspace found" };
  const workspaceId = memberships[0].workspaceId;

  const existing = await prisma.customDomain.findUnique({ where: { domain: parsed.data.domain } });
  if (existing) return { error: "This domain is already registered" };

  const domainCount = await prisma.customDomain.count({ where: { userId: session.user.id } });
  if (!canAddDomain(plan, domainCount)) {
    return { error: "You have reached your custom domain limit. Upgrade to Pro for unlimited domains." };
  }

  await prisma.customDomain.create({
    data: {
      domain: parsed.data.domain,
      userId: session.user.id,
      workspaceId,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/settings/domains");
  return { success: true };
}

export async function verifyDomainAction(domainId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const record = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!record || record.userId !== session.user.id) return { error: "Not found" };

  const expectedTarget = process.env.APP_DOMAIN ?? "linkpilot.app";
  let verified = false;

  try {
    const addresses = await dns.resolveCname(record.domain);
    verified = addresses.some((a) => a.includes(expectedTarget));
  } catch {
    verified = false;
  }

  await prisma.customDomain.update({
    where: { id: domainId },
    data: {
      status: verified ? "VERIFIED" : "FAILED",
      verifiedAt: verified ? new Date() : null,
      lastChecked: new Date(),
    },
  });

  revalidatePath("/dashboard/settings/domains");
  return { success: true, verified };
}

export async function removeDomainAction(domainId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const record = await prisma.customDomain.findUnique({ where: { id: domainId } });
  if (!record || record.userId !== session.user.id) return { error: "Not found" };

  await prisma.customDomain.delete({ where: { id: domainId } });
  revalidatePath("/dashboard/settings/domains");
  return { success: true };
}
