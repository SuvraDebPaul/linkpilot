"use server";

import { getServerSession } from "next-auth";
import QRCode from "qrcode";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import {
  generateBase32Secret,
  buildOtpAuthUrl,
  verifyTotp,
  generateBackupCodes,
} from "@/lib/totp";

type Result = { success: boolean; message: string };

export async function startTwoFactorSetupAction(): Promise<
  { success: true; secret: string; qrDataUrl: string } | { success: false; message: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return { success: false, message: "Unauthorized" };

  const secret = generateBase32Secret();
  const otpauthUrl = buildOtpAuthUrl(secret, session.user.email);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 });

  return { success: true, secret, qrDataUrl };
}

export async function confirmTwoFactorAction(
  secret: string,
  code: string,
): Promise<{ success: true; backupCodes: string[] } | { success: false; message: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  if (!verifyTotp(secret, code.trim())) {
    return { success: false, message: "Incorrect code. Check your authenticator app and try again." };
  }

  const backupCodes = generateBackupCodes();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true, twoFactorSecret: secret, twoFactorBackupCodes: backupCodes },
  });

  return { success: true, backupCodes };
}

export async function disableTwoFactorAction(code: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorBackupCodes: true },
  });
  if (!user?.twoFactorSecret) return { success: false, message: "Two-factor authentication isn't enabled." };

  const valid =
    verifyTotp(user.twoFactorSecret, code.trim()) ||
    user.twoFactorBackupCodes.includes(code.trim().toUpperCase());
  if (!valid) return { success: false, message: "Incorrect code." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
  });

  return { success: true, message: "Two-factor authentication disabled." };
}

export async function revokeAllSessionsAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { sessionVersion: { increment: 1 } },
  });

  return { success: true, message: "All sessions revoked. You'll need to sign in again." };
}
