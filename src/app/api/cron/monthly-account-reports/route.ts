import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { sendMonthlyAccountReportEmail } from "@/lib/email";
import { runCronJob } from "@/server/services/cron-log.service";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const isFirstOfMonth = now.getUTCDate() === 1;
  if (!isFirstOfMonth) {
    return NextResponse.json({ success: true, sent: 0, skipped: 0, reason: "not first of month" });
  }

  return runCronJob("monthly-account-reports", () => sendMonthlyReports(now));
}

async function sendMonthlyReports(now: Date) {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: { monthlyReportEnabled: true, email: { not: undefined } },
    select: {
      id: true,
      email: true,
      name: true,
      totalLinksCreated: true,
      totalCampaignsCreated: true,
      monthlyReportLastSentAt: true,
    },
  });

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    // Avoid double-send if the cron fires more than once on the 1st
    if (user.monthlyReportLastSentAt) {
      const hoursSinceLast = (now.getTime() - user.monthlyReportLastSentAt.getTime()) / 3_600_000;
      if (hoursSinceLast < 23) {
        skipped++;
        continue;
      }
    }

    try {
      const [clicksLast30Days, newLinksLast30Days] = await Promise.all([
        prisma.linkClickEvent.count({
          where: { link: { userId: user.id }, createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.link.count({
          where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

      await sendMonthlyAccountReportEmail({
        to: user.email,
        name: user.name,
        totalLinks: user.totalLinksCreated,
        totalCampaigns: user.totalCampaignsCreated,
        clicksLast30Days,
        newLinksLast30Days,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyReportLastSentAt: now },
      });

      sent++;
    } catch (err) {
      console.error(`[monthly-account-reports] failed for ${user.email}:`, err);
      errors++;
    }
  }

  console.log(`[monthly-account-reports] sent=${sent} skipped=${skipped} errors=${errors}`);
  return NextResponse.json({ success: true, sent, skipped, errors });
}
