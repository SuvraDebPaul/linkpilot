import bcrypt from "bcryptjs";

import { guestLinkLimits } from "@/constants/limits";
import {
  getGuestLinkDeleteAfterDate,
  getGuestLinkExpiryDate,
} from "@/features/guest-links/constants/guest-link.constants";
import type { CreateGuestLinkInput } from "@/features/guest-links/schemas/guest-link.schema";
import { generateShortCode, isReservedSlug } from "@/lib/slug";
import { prisma } from "@/server/db/prisma";
import { checkGuestLinkRateLimit } from "@/server/services/rate-limit.service";
import { validateSafeUrl } from "@/server/services/url-safety.service";

async function generateUniqueShortCode() {
  let attempts = 0;

  while (attempts < 10) {
    const shortCode = generateShortCode(guestLinkLimits.shortCodeLength);

    if (isReservedSlug(shortCode)) {
      attempts++;
      continue;
    }

    const existingGuestLink = await prisma.guestLink.findUnique({
      where: { shortCode },
      select: { id: true },
    });

    if (!existingGuestLink) {
      return shortCode;
    }

    attempts++;
  }

  throw new Error("Could not generate a unique short link. Please try again.");
}

export async function createGuestLinkService(params: {
  input: CreateGuestLinkInput;
  creatorIpHash: string | null;
  creatorUserAgent: string | null;
}) {
  const rateLimit = await checkGuestLinkRateLimit({
    creatorIpHash: params.creatorIpHash,
    maxPerHour: guestLinkLimits.maxLinksPerHour,
    maxPerDay: guestLinkLimits.maxLinksPerDay,
  });

  if (!rateLimit.allowed) {
    throw new Error(rateLimit.message);
  }

  const safeUrl = validateSafeUrl(params.input.originalUrl);
  const shortCode = await generateUniqueShortCode();

  const password = params.input.password?.trim();
  const hasPassword = Boolean(password);

  const passwordHash = hasPassword ? await bcrypt.hash(password!, 10) : null;

  return prisma.guestLink.create({
    data: {
      originalUrl: safeUrl,
      shortCode,
      passwordHash,
      isPasswordProtected: hasPassword,
      expiresAt: getGuestLinkExpiryDate(params.input.expiryPreset),
      deleteAfter: getGuestLinkDeleteAfterDate(),
      creatorIpHash: params.creatorIpHash,
      creatorUserAgent: params.creatorUserAgent,
    },
  });
}
