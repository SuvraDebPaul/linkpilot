import { prisma } from "@/server/db/prisma";

const CRON_JOBS = [
  "delete-expired-guest-links",
  "monthly-account-reports",
  "onboarding-emails",
  "reverify-domains",
  "send-report-emails",
] as const;

export async function getCronJobHealth() {
  const latest = await Promise.all(
    CRON_JOBS.map((jobName) =>
      prisma.cronRunLog.findFirst({
        where: { jobName },
        orderBy: { createdAt: "desc" },
      }),
    ),
  );

  return CRON_JOBS.map((jobName, i) => ({ jobName, lastRun: latest[i] }));
}

export async function getFeatureFlags() {
  return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
}

export async function getWebhookEvents(filters: { failedOnly?: boolean }, page = 1) {
  const pageSize = 50;
  const where = filters.failedOnly ? { status: "error" } : {};

  const [events, total] = await Promise.all([
    prisma.webhookEventLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.webhookEventLog.count({ where }),
  ]);

  return { events, total, pageSize };
}
