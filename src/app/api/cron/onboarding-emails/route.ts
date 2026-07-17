"use server";

import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import {
  sendOnboardingDay1Email,
  sendOnboardingDay3Email,
  sendOnboardingDay7Email,
} from "@/lib/email";
import { runCronJob } from "@/server/services/cron-log.service";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return runCronJob("onboarding-emails", sendOnboardingEmails);
}

async function sendOnboardingEmails() {
  const now = new Date();
  const results = { day1: 0, day3: 0, day7: 0, errors: 0 };

  // -- Day 1: signed up 1–2 days ago, day1 email not yet sent --
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const day1Users = await prisma.user.findMany({
    where: {
      email: { not: undefined },
      onboardingDay1SentAt: null,
      createdAt: { gte: twoDaysAgo, lte: oneDayAgo },
    },
    select: { id: true, email: true, name: true },
  });

  for (const user of day1Users) {
    try {
      await sendOnboardingDay1Email(user.email, user.name);
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingDay1SentAt: now },
      });
      results.day1++;
    } catch {
      results.errors++;
    }
  }

  // -- Day 3: signed up 3–4 days ago, day3 email not yet sent --
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

  const day3Users = await prisma.user.findMany({
    where: {
      email: { not: undefined },
      onboardingDay1SentAt: { not: null },
      onboardingDay3SentAt: null,
      createdAt: { gte: fourDaysAgo, lte: threeDaysAgo },
    },
    select: { id: true, email: true, name: true, totalCampaignsCreated: true },
  });

  for (const user of day3Users) {
    try {
      await sendOnboardingDay3Email(user.email, user.name, user.totalCampaignsCreated > 0);
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingDay3SentAt: now },
      });
      results.day3++;
    } catch {
      results.errors++;
    }
  }

  // -- Day 7: signed up 7–8 days ago, day7 email not yet sent --
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  const day7Users = await prisma.user.findMany({
    where: {
      email: { not: undefined },
      onboardingDay1SentAt: { not: null },
      onboardingDay7SentAt: null,
      createdAt: { gte: eightDaysAgo, lte: sevenDaysAgo },
    },
    select: {
      id: true,
      email: true,
      name: true,
      totalLinksCreated: true,
      totalCampaignsCreated: true,
    },
  });

  for (const user of day7Users) {
    try {
      await sendOnboardingDay7Email(
        user.email,
        user.name,
        user.totalLinksCreated,
        user.totalCampaignsCreated,
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingDay7SentAt: now },
      });
      results.day7++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ success: true, results });
}
