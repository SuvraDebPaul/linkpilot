import { prisma } from "@/server/db/prisma";

export async function checkGuestLinkRateLimit(params: {
  creatorIpHash: string | null;
  maxPerHour: number;
  maxPerDay: number;
}) {
  if (!params.creatorIpHash) {
    return {
      allowed: false,
      message: "Unable to verify request. Please try again later.",
    };
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [hourlyCount, dailyCount] = await Promise.all([
    prisma.guestLink.count({
      where: {
        creatorIpHash: params.creatorIpHash,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    }),

    prisma.guestLink.count({
      where: {
        creatorIpHash: params.creatorIpHash,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    }),
  ]);

  if (hourlyCount >= params.maxPerHour) {
    return {
      allowed: false,
      message: `You can create up to ${params.maxPerHour} free links per hour. Please try again later.`,
    };
  }

  if (dailyCount >= params.maxPerDay) {
    return {
      allowed: false,
      message: `You can create up to ${params.maxPerDay} free links per day. Please create an account for more.`,
    };
  }

  return {
    allowed: true,
    message: "Allowed",
  };
}
