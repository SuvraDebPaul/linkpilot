"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { prisma } from "@/server/db/prisma";

// Every upload lands under <workspace-slug>/<subFolder> in Cloudinary, so each
// workspace's assets stay grouped together and organized by what they're for.
export type UploadFolder = "avatars" | "branding-logos" | "qr-logos" | "og-images";

type SignatureResult =
  | {
      success: true;
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    }
  | { success: false; message: string };

export async function getUploadSignatureAction(subFolder: UploadFolder): Promise<SignatureResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    return { success: false, message: "Image uploads aren't configured yet — missing Cloudinary credentials." };
  }

  const workspaceId = await ensureWorkspace(session.user.id);
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });
  if (!workspace) return { success: false, message: "Workspace not found" };

  const folder = `${workspace.slug}/${subFolder}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return { success: true, signature, timestamp, apiKey, cloudName, folder };
}
