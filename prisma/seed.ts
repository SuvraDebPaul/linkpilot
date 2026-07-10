/**
 * Demo data seed for presenting LinkPilot.
 *
 * Creates a single "demo@linkpilot.com" user with lifetime Pro access and a
 * realistic, fully-populated account: multiple workspaces, team members,
 * custom domains in every status, campaigns, 500 links covering every link
 * feature (password protection, expiry, cloaking, geo-targeting, A/B tests,
 * retargeting pixels, OG tags, custom redirect types), ~9k click events with
 * realistic device/browser/country distributions, client portals, and
 * reusable templates.
 *
 * Safe to re-run: it deletes any previous demo data for this email first.
 *
 * Usage: npm run seed
 */
import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DomainStatus } from "../src/generated/prisma/enums";
import type { WorkspaceRole, DeviceType } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Config ──────────────────────────────────────────────────────────────

const DEMO_EMAIL = "demo@linkpilot.com";
const DEMO_PASSWORD = "linkpilot@demo";
const LINK_PASSWORD = "demo1234"; // unlocks every password-protected demo link

const TEAM_EMAILS = [
  "alex.rivera@demo.linkpilot.dev",
  "jordan.lee@demo.linkpilot.dev",
  "sam.patel@demo.linkpilot.dev",
];

const TOTAL_LINKS = 500;
const TOTAL_CAMPAIGNS = 50;
const TOTAL_DOMAINS = 10;
const TOTAL_CLIENTS = 8;
const PRIMARY_CLICK_TARGET = 9000;
const SECONDARY_CLICK_TARGET = 500;
const CLICK_DAYS = 90;

// ─── Deterministic RNG (reproducible seed data) ─────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260709);

function id() {
  return crypto.randomUUID();
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function chance(pct: number) {
  return rand() < pct;
}
function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function weightedPick<T>(pairs: Array<[T, number]>): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, weight] of pairs) {
    r -= weight;
    if (r <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
}
function shortCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 7);
}
async function chunkedCreateMany<T>(
  label: string,
  rows: T[],
  create: (batch: T[]) => Promise<unknown>,
  size = 1000,
) {
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size);
    await create(batch);
    console.log(
      `  ${label}: ${Math.min(i + size, rows.length)}/${rows.length}`,
    );
  }
}

// ─── Content pools ───────────────────────────────────────────────────────

const BRANDS = [
  "acmeapparel.com",
  "auroratech.io",
  "brightpathmedia.com",
  "nimbuscloud.app",
  "verdantgoods.co",
  "pulsefitness.com",
  "lumenstudio.design",
  "craftedcoffeeco.com",
];

const TITLES = [
  "Summer Sale Landing Page",
  "Black Friday Deals",
  "Product Launch — Aurora Watch",
  "Newsletter Signup",
  "Free Shipping Promo",
  "Instagram Bio Link",
  "Referral Program",
  "Customer Feedback Survey",
  "App Download — iOS",
  "App Download — Android",
  "Webinar Registration",
  "Holiday Gift Guide",
  "Flash Sale — 24 Hours",
  "New Arrivals",
  "Loyalty Program Signup",
  "Support Center",
  "Careers Page",
  "Press Kit",
  "Case Study — Acme Corp",
  "Partner Portal",
  "Affiliate Signup",
  "Podcast Episode 12",
  "YouTube Video — Unboxing",
  "TikTok Campaign",
  "LinkedIn Article",
  "Pinterest Board",
  "Spring Collection",
  "Clearance Sale",
  "VIP Early Access",
  "Product Demo Booking",
  "Free Trial Signup",
  "Pricing Page",
  "Blog — Top 10 Tips",
  "Event RSVP",
  "Community Forum",
  "Documentation",
  "API Reference",
  "Contact Sales",
  "Book a Call",
  "Customer Portal Login",
  "Quarterly Report",
  "Team Onboarding Kit",
  "Beta Signup",
];

const TAGS_POOL = [
  "social",
  "email",
  "paid-ads",
  "organic",
  "launch",
  "promo",
  "retargeting",
  "seasonal",
];

const CHANNELS = [
  "Instagram",
  "Facebook",
  "Twitter/X",
  "Email",
  "Google Ads",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "Affiliate",
  "SMS",
];
const THEMES = [
  "Summer Sale",
  "Black Friday",
  "Product Launch",
  "Newsletter",
  "Referral Program",
  "Retargeting",
  "Brand Awareness",
  "Holiday Promo",
  "Flash Sale",
  "App Install",
  "Webinar Series",
  "Customer Winback",
  "VIP Access",
  "Spring Collection",
  "Clearance",
];

const CLIENT_NAMES = [
  "Acme Retail Co.",
  "Bright Path Media",
  "Nimbus Cloud Ventures",
  "Verdant Goods",
  "Pulse Fitness Studios",
  "Lumen Design Studio",
  "Crafted Coffee Co.",
  "Aurora Tech Labs",
];

const COUNTRY_WEIGHTS: Array<[string, number]> = [
  ["United States", 38],
  ["India", 14],
  ["United Kingdom", 10],
  ["Germany", 7],
  ["Canada", 6],
  ["Australia", 4],
  ["France", 3],
  ["Brazil", 3],
  ["Japan", 2],
  ["Singapore", 2],
  ["Netherlands", 2],
  ["Spain", 2],
  ["Mexico", 2],
  ["Sweden", 1],
  ["Italy", 1],
  ["South Korea", 1],
  ["Ireland", 1],
  ["Poland", 1],
];
const BROWSER_WEIGHTS: Array<[string, number]> = [
  ["Chrome", 52],
  ["Safari", 18],
  ["Firefox", 12],
  ["Edge", 10],
  ["Brave", 5],
  ["Other", 3],
];
const OS_WEIGHTS: Array<[string, number]> = [
  ["Windows", 42],
  ["macOS", 20],
  ["Android", 20],
  ["iOS", 13],
  ["Linux", 3],
  ["Other", 2],
];
const DEVICE_WEIGHTS: Array<[DeviceType, number]> = [
  ["DESKTOP", 56],
  ["MOBILE", 36],
  ["TABLET", 7],
  ["UNKNOWN", 1],
];
const REFERRER_WEIGHTS: Array<[string | null, number]> = [
  [null, 38],
  ["https://www.google.com/", 15],
  ["https://www.instagram.com/", 12],
  ["https://twitter.com/", 10],
  ["https://www.facebook.com/", 10],
  ["https://www.linkedin.com/", 6],
  ["https://www.tiktok.com/", 5],
  ["https://www.youtube.com/", 4],
];
const GEO_COUNTRY_CODES = [
  "US",
  "GB",
  "AU",
  "CA",
  "DE",
  "FR",
  "ES",
  "IT",
  "IN",
  "SG",
  "JP",
];

// ─── Cleanup ─────────────────────────────────────────────────────────────

async function cleanupExisting() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });
  if (existing) {
    const ownedMemberships = await prisma.workspaceMember.findMany({
      where: { userId: existing.id, role: "OWNER" },
      select: { workspaceId: true },
    });
    if (ownedMemberships.length) {
      await prisma.workspace.deleteMany({
        where: { id: { in: ownedMemberships.map((m) => m.workspaceId) } },
      });
    }
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("Removed previous demo data.");
  }
  await prisma.user.deleteMany({ where: { email: { in: TEAM_EMAILS } } });
}

// ─── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding LinkPilot demo data…\n");
  await cleanupExisting();

  // 1. Demo user — lifetime Pro access
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const linkPasswordHash = await bcrypt.hash(LINK_PASSWORD, 12);
  const demoUser = await prisma.user.create({
    data: {
      id: id(),
      name: "Demo User",
      email: DEMO_EMAIL,
      password: passwordHash,
      emailVerified: new Date(),
      onboardingCompleted: true,
      lifetimeAccess: true,
      isDemoAccount: true,
      monthlyReportEnabled: true,
      totalLinksCreated: TOTAL_LINKS,
      totalCampaignsCreated: TOTAL_CAMPAIGNS,
    },
  });
  console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // 2. Team member accounts (manually-created + one self-joined)
  const teamPasswordHash = await bcrypt.hash("teammember@demo", 12);
  const [alex, jordan, sam] = await Promise.all(
    TEAM_EMAILS.map((email, i) =>
      prisma.user.create({
        data: {
          id: id(),
          name: ["Alex Rivera", "Jordan Lee", "Sam Patel"][i],
          email,
          password: teamPasswordHash,
          emailVerified: new Date(),
          onboardingCompleted: true,
          createdAsWorkspaceMember: i < 2,
          isDemoAccount: true,
        },
      }),
    ),
  );
  console.log("Created team member accounts.");

  // 3. Workspaces
  const primaryWorkspace = await prisma.workspace.create({
    data: {
      id: id(),
      name: "Acme Marketing",
      slug: "demo-acme-marketing",
      slugStyle: "secure",
      defaultRedirectType: "301",
      defaultCloakingEnabled: true,
      brandColor: "#7c3aed",
      hideBranding: true,
    },
  });
  const secondaryWorkspaces = await Promise.all([
    prisma.workspace.create({
      data: { id: id(), name: "Growth Team", slug: "demo-growth-team" },
    }),
    prisma.workspace.create({
      data: { id: id(), name: "Client Projects", slug: "demo-client-projects" },
    }),
  ]);
  console.log("Created 3 workspaces.");

  await prisma.workspaceMember.createMany({
    data: [
      {
        id: id(),
        userId: demoUser.id,
        workspaceId: primaryWorkspace.id,
        role: "OWNER",
      },
      {
        id: id(),
        userId: alex.id,
        workspaceId: primaryWorkspace.id,
        role: "ADMIN",
      },
      {
        id: id(),
        userId: jordan.id,
        workspaceId: primaryWorkspace.id,
        role: "MEMBER",
      },
      {
        id: id(),
        userId: sam.id,
        workspaceId: primaryWorkspace.id,
        role: "MEMBER",
      },
      ...secondaryWorkspaces.map((w) => ({
        id: id(),
        userId: demoUser.id,
        workspaceId: w.id,
        role: "OWNER" as WorkspaceRole,
      })),
    ],
  });

  // Pending invite awaiting acceptance
  await prisma.verificationToken.create({
    data: {
      identifier: `invite:${primaryWorkspace.id}:taylor.morgan@example.com`,
      token: id(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Custom domains — every status represented
  const domainDefs: Array<{ domain: string; status: DomainStatus }> = [
    { domain: "go.acmeapparel.com", status: DomainStatus.VERIFIED },
    { domain: "link.auroratech.io", status: DomainStatus.VERIFIED },
    { domain: "s.brightpathmedia.com", status: DomainStatus.VERIFIED },
    { domain: "go.nimbuscloud.app", status: DomainStatus.VERIFIED },
    { domain: "link.verdantgoods.co", status: DomainStatus.VERIFIED },
    { domain: "s.pulsefitness.com", status: DomainStatus.VERIFIED },
    { domain: "go.lumenstudio.design", status: DomainStatus.PENDING },
    { domain: "link.craftedcoffeeco.com", status: DomainStatus.PENDING },
    { domain: "s.oldbrand.com", status: DomainStatus.FAILED },
    { domain: "go.testmigration.com", status: DomainStatus.FAILED },
  ].slice(0, TOTAL_DOMAINS);

  const domains = domainDefs.map((d) => ({ ...d, id: id() }));
  await prisma.customDomain.createMany({
    data: domains.map((d) => ({
      id: d.id,
      userId: demoUser.id,
      workspaceId: primaryWorkspace.id,
      domain: d.domain,
      status: d.status,
      verifiedAt: d.status === "VERIFIED" ? new Date() : null,
      lastChecked: new Date(),
    })),
  });
  const verifiedDomains = domains.filter((d) => d.status === "VERIFIED");
  console.log(`Created ${domains.length} custom domains.`);

  // 5. Campaigns
  const campaignCombos = shuffle(
    CHANNELS.flatMap((channel) =>
      THEMES.map((theme) => `${channel} — ${theme}`),
    ),
  ).slice(0, TOTAL_CAMPAIGNS);

  const campaigns = campaignCombos.map((name, i) => ({
    id: id(),
    name,
    reportEmailEnabled: i < 5,
    reportEmailFrequency: i < 5 ? pick(["weekly", "monthly"] as const) : null,
    // Every campaign gets a share token so client portals can always link to
    // a working public report, regardless of which campaigns end up assigned
    // to which client.
    shareToken: id(),
  }));
  await prisma.campaign.createMany({
    data: campaigns.map((c) => ({
      id: c.id,
      userId: demoUser.id,
      workspaceId: primaryWorkspace.id,
      name: c.name,
      reportEmailEnabled: c.reportEmailEnabled,
      reportEmailFrequency: c.reportEmailFrequency,
      reportEmailRecipients: c.reportEmailEnabled ? ["client@example.com"] : [],
      shareToken: c.shareToken,
    })),
  });
  console.log(`Created ${campaigns.length} campaigns.`);

  // Secondary workspaces get a handful of their own campaigns + links
  const secondaryCampaigns = secondaryWorkspaces.map((w) => ({
    workspace: w,
    campaigns: Array.from({ length: 3 }, (_, i) => ({
      id: id(),
      name: `${pick(CHANNELS)} — ${pick(THEMES)} ${i + 1}`,
    })),
  }));
  for (const group of secondaryCampaigns) {
    await prisma.campaign.createMany({
      data: group.campaigns.map((c) => ({
        id: c.id,
        userId: demoUser.id,
        workspaceId: group.workspace.id,
        name: c.name,
      })),
    });
  }

  // 6. Links — primary workspace, covering every feature
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  function buildLink(workspaceId: string, campaignId: string | null) {
    // Every demo link points at the same real, safe destination — clicking
    // through during a live presentation always resolves instead of hanging
    // on a fake placeholder domain. This also matches DEMO_SAFE_URL, the
    // fixed target enforced server-side for any link a demo account creates
    // (see src/server/services/demo-guard.service.ts).
    const originalUrl = "https://linkpilot.com";
    const createdAt = new Date(now - randomInt(0, 120) * DAY);

    let expiresAt: Date | null = null;
    let isActive = true;
    if (chance(0.08))
      expiresAt = new Date(now - randomInt(1, 60) * DAY); // expired
    else if (chance(0.06))
      expiresAt = new Date(now + randomInt(1, 6) * DAY); // expiring soon
    else if (chance(0.05)) expiresAt = new Date(now + randomInt(90, 365) * DAY);

    let maxClicks: number | null = null;
    if (chance(0.06)) {
      maxClicks = randomInt(50, 200);
      isActive = false; // limit reached
    } else if (chance(0.05)) {
      maxClicks = randomInt(5000, 20000);
    }
    if (chance(0.04)) isActive = false; // manually paused, independent of limits

    const hasPassword = chance(0.05);
    const hasOg = chance(0.2);
    const hasGeo = chance(0.1);
    const hasAb = chance(0.08);
    const hasPixels = chance(0.08);
    const useDomain = chance(0.12) && verifiedDomains.length > 0;

    return {
      id: id(),
      userId: demoUser.id,
      workspaceId,
      campaignId,
      customDomainId: useDomain ? pick(verifiedDomains).id : null,
      title: pick(TITLES),
      originalUrl,
      shortCode: shortCode(),
      passwordHash: hasPassword ? linkPasswordHash : null,
      isPasswordProtected: hasPassword,
      expiresAt,
      maxClicks,
      notes: chance(0.1)
        ? "Internal note: verify tracking before next campaign push."
        : null,
      tags: shuffle(TAGS_POOL).slice(0, randomInt(0, 3)),
      isActive,
      geoTargets: hasGeo
        ? shuffle(GEO_COUNTRY_CODES)
            .slice(0, randomInt(2, 4))
            .map((code) => ({
              country: code,
              url: originalUrl,
            }))
        : undefined,
      abVariants: hasAb
        ? [
            { url: originalUrl, weight: 50 },
            { url: originalUrl, weight: 50 },
          ]
        : undefined,
      retargetingPixels: hasPixels
        ? [
            {
              type: pick(["meta", "google", "tiktok", "linkedin"] as const),
              id: String(randomInt(100000, 999999)),
            },
          ]
        : undefined,
      isFavorite: chance(0.1),
      isCloaked: chance(0.15),
      hideReferrer: chance(0.1),
      redirectType: weightedPick<"301" | "302" | "307" | "308">([
        ["302", 70],
        ["301", 20],
        ["307", 6],
        ["308", 4],
      ]),
      ogTitle: hasOg ? pick(TITLES) : null,
      ogDescription: hasOg
        ? "Discover more and shop the collection today."
        : null,
      qrFgColor: chance(0.2) ? "#7c3aed" : "#000000",
      createdAt,
      updatedAt: createdAt,
    };
  }

  const linksWithCampaign = campaigns.flatMap((c) => {
    const count = randomInt(3, 15);
    return Array.from({ length: count }, () => c.id);
  });
  const campaignAssignments = shuffle(linksWithCampaign).slice(
    0,
    Math.floor(TOTAL_LINKS * 0.7),
  );
  const links = Array.from({ length: TOTAL_LINKS }, (_, i) =>
    buildLink(primaryWorkspace.id, campaignAssignments[i] ?? null),
  );

  await chunkedCreateMany("links", links, (batch) =>
    prisma.link.createMany({ data: batch }),
  );
  console.log(`Created ${links.length} links on Acme Marketing.`);

  // Secondary workspace links (lighter — no click-feature variety needed)
  const secondaryLinkSets = secondaryCampaigns.map((group) =>
    Array.from({ length: 15 }, () =>
      buildLink(
        group.workspace.id,
        chance(0.6) ? pick(group.campaigns).id : null,
      ),
    ),
  );
  for (const linkSet of secondaryLinkSets) {
    await prisma.link.createMany({ data: linkSet });
  }
  console.log("Created secondary workspace links.");

  // 7. Click events — Pareto-weighted across links, spread over CLICK_DAYS
  async function seedClicks(
    workspaceLinks: typeof links,
    target: number,
    label: string,
  ) {
    const sorted = [...workspaceLinks].sort(() => rand() - 0.5);
    const linkWeights: Array<[string, number]> = sorted.map((l, i) => [
      l.id,
      i < sorted.length * 0.2 ? 8 : 1, // top 20% get 8x weight (pareto)
    ]);

    const dayTargets: number[] = [];
    let rawTotal = 0;
    for (let d = 0; d < CLICK_DAYS; d++) {
      const growth = 0.6 + 0.4 * (d / CLICK_DAYS);
      const dayOfWeek = new Date(now - (CLICK_DAYS - d) * DAY).getDay();
      const weekday = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.1;
      const noise = 0.75 + rand() * 0.5;
      const raw = growth * weekday * noise;
      dayTargets.push(raw);
      rawTotal += raw;
    }
    const scale = target / rawTotal;

    // A fixed pool of fake visitors reused across clicks, so "unique visitors"
    // (distinct ipHash) comes out to a realistic ~60% of total clicks instead
    // of every click looking like a brand-new visitor.
    const visitorPool = Array.from({ length: Math.max(50, Math.round(target * 0.6)) }, () =>
      crypto.randomUUID(),
    );

    const clickRows: Array<{
      id: string;
      linkId: string;
      ipHash: string;
      country: string;
      city: string | null;
      device: DeviceType;
      browser: string;
      os: string;
      referrer: string | null;
      userAgent: string | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      createdAt: Date;
    }> = [];

    for (let d = 0; d < CLICK_DAYS; d++) {
      const count = Math.round(dayTargets[d] * scale);
      const dayStart = now - (CLICK_DAYS - d) * DAY;
      for (let c = 0; c < count; c++) {
        const linkId = weightedPick(linkWeights);
        const withUtm = chance(0.35);
        clickRows.push({
          id: id(),
          linkId,
          ipHash: crypto
            .createHash("sha256")
            .update(pick(visitorPool))
            .digest("hex"),
          country: weightedPick(COUNTRY_WEIGHTS),
          city: null,
          device: weightedPick(DEVICE_WEIGHTS),
          browser: weightedPick(BROWSER_WEIGHTS),
          os: weightedPick(OS_WEIGHTS),
          referrer: weightedPick(REFERRER_WEIGHTS),
          userAgent: null,
          utmSource: withUtm
            ? pick(CHANNELS)
                .toLowerCase()
                .replace(/[^a-z]/g, "")
            : null,
          utmMedium: withUtm
            ? pick(["social", "email", "cpc", "organic"])
            : null,
          utmCampaign: withUtm
            ? pick(THEMES).toLowerCase().replace(/\s+/g, "-")
            : null,
          createdAt: new Date(dayStart + randomInt(0, DAY - 1)),
        });
      }
    }

    await chunkedCreateMany(label, clickRows, (batch) =>
      prisma.linkClickEvent.createMany({ data: batch }),
    );
  }

  await seedClicks(links, PRIMARY_CLICK_TARGET, "clicks (Acme Marketing)");
  for (const linkSet of secondaryLinkSets) {
    await seedClicks(
      linkSet,
      SECONDARY_CLICK_TARGET,
      "clicks (secondary workspace)",
    );
  }
  console.log("Seeded click events.");

  // 8. Client portals
  const clientDefs = CLIENT_NAMES.slice(0, TOTAL_CLIENTS);
  const clients = clientDefs.map((name, i) => ({
    id: id(),
    clientName: name,
    clientEmail: `contact@${BRANDS[i % BRANDS.length]}`,
  }));
  await prisma.clientAccess.createMany({
    data: clients.map((c) => ({
      id: c.id,
      clientName: c.clientName,
      clientEmail: c.clientEmail,
      createdByUserId: demoUser.id,
      workspaceId: primaryWorkspace.id,
    })),
  });
  const clientCampaignRows = clients.flatMap((c) =>
    shuffle(campaigns)
      .slice(0, randomInt(1, 4))
      .map((camp) => ({
        id: id(),
        clientAccessId: c.id,
        campaignId: camp.id,
      })),
  );
  await prisma.clientCampaignAccess.createMany({ data: clientCampaignRows });
  console.log(`Created ${clients.length} client portals.`);

  // 9. Reusable templates
  await prisma.geoTemplate.createMany({
    data: [
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "English-speaking markets",
        targets: [
          { country: "US", url: "https://acmeapparel.com/en-us" },
          { country: "GB", url: "https://acmeapparel.com/en-gb" },
          { country: "AU", url: "https://acmeapparel.com/en-au" },
          { country: "CA", url: "https://acmeapparel.com/en-ca" },
        ],
      },
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "EU markets",
        targets: [
          { country: "DE", url: "https://acmeapparel.com/de" },
          { country: "FR", url: "https://acmeapparel.com/fr" },
          { country: "ES", url: "https://acmeapparel.com/es" },
          { country: "IT", url: "https://acmeapparel.com/it" },
        ],
      },
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "APAC growth",
        targets: [
          { country: "IN", url: "https://acmeapparel.com/in" },
          { country: "SG", url: "https://acmeapparel.com/sg" },
          { country: "JP", url: "https://acmeapparel.com/jp" },
        ],
      },
    ],
  });
  await prisma.campaignTemplate.createMany({
    data: [
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "Instagram Bio",
        source: "instagram",
        medium: "social",
        campaign: "bio-link",
      },
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "Email Newsletter",
        source: "newsletter",
        medium: "email",
        campaign: "weekly-digest",
      },
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "Google Ads — Search",
        source: "google",
        medium: "cpc",
        campaign: "search-brand",
      },
      {
        id: id(),
        workspaceId: primaryWorkspace.id,
        name: "TikTok Ad",
        source: "tiktok",
        medium: "paid-social",
        campaign: "video-ad",
      },
    ],
  });
  console.log("Created geo + campaign templates.");

  // 10. Login activity
  await prisma.loginEvent.createMany({
    data: [
      {
        id: id(),
        userId: demoUser.id,
        type: "credentials",
        ip: "203.0.113.42",
        country: "United States",
        browser: "Chrome",
        createdAt: new Date(now - 1 * DAY),
      },
      {
        id: id(),
        userId: demoUser.id,
        type: "credentials",
        ip: "203.0.113.42",
        country: "United States",
        browser: "Chrome",
        createdAt: new Date(now - 4 * DAY),
      },
      {
        id: id(),
        userId: demoUser.id,
        type: "google",
        ip: "198.51.100.17",
        country: "United States",
        browser: "Safari",
        createdAt: new Date(now - 9 * DAY),
      },
      {
        id: id(),
        userId: demoUser.id,
        type: "credentials",
        ip: "192.0.2.88",
        country: "United Kingdom",
        browser: "Firefox",
        createdAt: new Date(now - 15 * DAY),
      },
      {
        id: id(),
        userId: demoUser.id,
        type: "registration",
        ip: "203.0.113.42",
        country: "United States",
        browser: "Chrome",
        createdAt: new Date(now - 30 * DAY),
      },
    ],
  });

  console.log("\nDemo data ready.");
  console.log(`  Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(
    `  Workspaces: Acme Marketing (primary), Growth Team, Client Projects`,
  );
  console.log(
    `  Links: ${links.length + secondaryLinkSets.flat().length}  Campaigns: ${campaigns.length + secondaryCampaigns.flatMap((g) => g.campaigns).length}`,
  );
  console.log(`  Domains: ${domains.length}  Clients: ${clients.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
