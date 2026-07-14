"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { prisma } from "@/server/db/prisma";

// Every upload lands under <workspace-slug>/<subFolder> in Cloudinary, so each
// workspace's assets stay grouped together and organized by what they're for.
export type UploadFolder = "avatars" | "branding-logos" | "qr-logos" | "og-images";

// Signed into every upload so Cloudinary itself rejects mismatched files —
// the client can't strip or alter this without invalidating the signature.
const ALLOWED_FORMATS = "png,jpg,jpeg,gif,webp";

type SignatureResult =
  | {
      success: true;
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
      allowedFormats: string;
    }
  | { success: false; message: string };

export async function getUploadSignatureAction(subFolder: UploadFolder): Promise<SignatureResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

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

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp, allowed_formats: ALLOWED_FORMATS },
    apiSecret,
  );

  return { success: true, signature, timestamp, apiKey, cloudName, folder, allowedFormats: ALLOWED_FORMATS };
}
