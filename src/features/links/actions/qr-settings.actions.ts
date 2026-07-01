"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

const schema = z.object({
  fgColor:  z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  bgColor:  z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  ecLevel:  z.enum(["L", "M", "Q", "H"]).default("M"),
  margin:   z.number().int().min(0).max(4).default(2),
  logoUrl:  z.string().url().optional().or(z.literal("")),
});

type Input = z.infer<typeof schema>;

type Result = { success: true } | { success: false; message: string };

export async function saveQrSettingsAction(linkId: string, input: Input): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid settings." };

  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId: session.user.id } } } },
    select: { id: true },
  });
  if (!link) return { success: false, message: "Link not found." };

  const { fgColor, bgColor, ecLevel, margin, logoUrl } = parsed.data;

  await prisma.link.update({
    where: { id: linkId },
    data: {
      qrFgColor: fgColor,
      qrBgColor: bgColor,
      qrEcLevel: ecLevel,
      qrMargin:  margin,
      qrLogoUrl: logoUrl || null,
    },
  });

  revalidatePath(`/dashboard/links/${linkId}`);
  return { success: true };
}
