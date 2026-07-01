"use server";

import { createGuestLinkSchema } from "@/features/guest-links/schemas/guest-link.schema";
import type { CreateGuestLinkResponse } from "@/features/guest-links/types/guest-link.types";
import { hashValue } from "@/lib/crypto";
import { getClientIp } from "@/lib/url";
import { checkGuestLinkRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";
import { createGuestLinkService } from "@/server/services/guest-link.service";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";

export async function createGuestLinkAction(
  input: unknown,
  req: Request,
): Promise<CreateGuestLinkResponse> {
  const parsed = createGuestLinkSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your input.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const ip = getClientIp(req);
    const creatorIpHash = ip ? hashValue(ip) : null;
    const creatorUserAgent = req.headers.get("user-agent");

    const allowed = await checkGuestLinkRateLimit(creatorIpHash);
    if (!allowed) {
      return {
        success: false,
        message: "Too many links created recently. Please wait an hour before creating another.",
        rateLimited: true,
      };
    }

    const guestLink = await createGuestLinkService({
      input: parsed.data,
      creatorIpHash,
      creatorUserAgent,
    });

    const shortUrl = `${siteConfig.url}/${guestLink.shortCode}`;
    const qrCodeDataUrl = await generateQrCodeDataUrl(shortUrl);

    return {
      success: true,
      message: "Temporary link created successfully.",
      data: {
        shortUrl,
        shortCode: guestLink.shortCode,
        expiresAt: guestLink.expiresAt.toISOString(),
        qrCodeDataUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create temporary link.",
    };
  }
}
