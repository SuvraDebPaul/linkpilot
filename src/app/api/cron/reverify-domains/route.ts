"use server";

import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { checkDomainCname } from "@/server/services/domain-verification.service";
import { runCronJob } from "@/server/services/cron-log.service";

// Verified domains are trusted forever otherwise — if a customer lets their
// CNAME lapse or repoints it, this catches it instead of leaving a stale
// VERIFIED status (and the redirect access it grants) in place indefinitely.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return runCronJob("reverify-domains", reverifyDomains);
}

async function reverifyDomains() {
  const domains = await prisma.customDomain.findMany({
    where: { status: "VERIFIED" },
    select: { id: true, domain: true },
  });

  const results = { checked: domains.length, revoked: 0, errors: 0 };

  for (const domain of domains) {
    try {
      const stillVerified = await checkDomainCname(domain.domain);
      await prisma.customDomain.update({
        where: { id: domain.id },
        data: stillVerified
          ? { lastChecked: new Date() }
          : { status: "FAILED", verifiedAt: null, lastChecked: new Date() },
      });
      if (!stillVerified) results.revoked++;
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ success: true, results });
}
