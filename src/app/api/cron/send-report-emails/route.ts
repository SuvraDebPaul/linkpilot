import { NextResponse } from "next/server";

import { getCampaignsForReportEmail } from "@/server/queries/campaign.queries";
import { sendCampaignReportEmail } from "@/lib/email";
import { prisma } from "@/server/db/prisma";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://linkpilot.app";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay();   // 0 = Sunday, 1 = Monday
  const dayOfMonth = now.getUTCDate(); // 1–31

  const isMonday = dayOfWeek === 1;
  const isFirstOfMonth = dayOfMonth === 1;

  const campaigns = await getCampaignsForReportEmail();

  let sent = 0;
  let skipped = 0;

  for (const campaign of campaigns) {
    const { reportEmailFrequency, reportEmailLastSentAt, reportEmailRecipients, shareToken, workspace } = campaign;

    // Check if it's the right day for this frequency
    if (reportEmailFrequency === "weekly" && !isMonday) { skipped++; continue; }
    if (reportEmailFrequency === "monthly" && !isFirstOfMonth) { skipped++; continue; }

    // Avoid double-send: skip if already sent within the last 23 hours
    if (reportEmailLastSentAt) {
      const hoursSinceLast = (now.getTime() - reportEmailLastSentAt.getTime()) / 3_600_000;
      if (hoursSinceLast < 23) { skipped++; continue; }
    }

    // Build stats for the period
    const days = reportEmailFrequency === "weekly" ? 7 : 30;
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const linkIds = campaign.links.map((l) => l.id);

    const clicksInPeriod = linkIds.length
      ? await prisma.linkClickEvent.count({
          where: { linkId: { in: linkIds }, createdAt: { gte: periodStart } },
        })
      : 0;

    // Top 5 links by clicks in period
    const clicksPerLink = linkIds.length
      ? await prisma.linkClickEvent.groupBy({
          by: ["linkId"],
          where: { linkId: { in: linkIds }, createdAt: { gte: periodStart } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        })
      : [];

    const topLinks = clicksPerLink.map((row) => {
      const link = campaign.links.find((l) => l.id === row.linkId);
      return {
        title: link?.title || link?.shortCode || row.linkId,
        clicks: row._count.id,
      };
    });

    const periodLabel = reportEmailFrequency === "weekly"
      ? `Past 7 days (${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${now.toLocaleDateString("en-GB", { day: "numeric", month: "short" })})`
      : `Past 30 days (${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${now.toLocaleDateString("en-GB", { day: "numeric", month: "short" })})`;

    const reportUrl = `${APP_URL}/report/${shareToken}`;

    // Send to each recipient
    const sends = reportEmailRecipients.map((to) =>
      sendCampaignReportEmail({
        to,
        campaignName: campaign.name,
        reportUrl,
        periodLabel,
        totalClicks: clicksInPeriod,
        topLinks,
        brandLogoUrl: workspace.brandLogoUrl,
        brandColor: workspace.brandColor,
      }).catch((err) => console.error(`[report-email] failed to ${to}:`, err)),
    );

    await Promise.all(sends);

    // Mark sent
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { reportEmailLastSentAt: now },
    });

    sent += reportEmailRecipients.length;
  }

  console.log(`[report-emails] sent=${sent} skipped=${skipped}`);
  return NextResponse.json({ sent, skipped });
}
