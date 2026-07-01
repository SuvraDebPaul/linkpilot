/**
 * Realistic demo data for dashboard UI preview.
 * Toggle with NEXT_PUBLIC_DEMO=true in .env.local
 * Remove or disable once design is verified.
 */

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isoAgo(n: number): string {
  return daysAgo(n).toISOString().slice(0, 10);
}

// Realistic daily click curve — peaks mid-week, weekends quieter
const DAILY_PATTERN = [
  4, 9, 14, 22, 18, 7, 3,   // week 1
  5, 12, 28, 35, 30, 11, 4,  // week 2
  6, 20, 42, 55, 48, 18, 6,  // week 3
  8, 25, 60, 72, 64, 22, 9,  // week 4
];

export function getDemoLinks() {
  return [
    // ── Active, high-traffic ──────────────────────────────────────────────────
    { id: "dl-01", title: "Summer Campaign Landing Page",        shortCode: "summer24",   originalUrl: "https://mystore.com/summer-sale-2024",                    isActive: true,  isPasswordProtected: false, isFavorite: true,  expiresAt: null,         createdAt: daysAgo(45),  tags: ["summer", "campaign"],   _count: { clicks: 3_812 } },
    { id: "dl-02", title: "Google Ads — Brand Campaign",         shortCode: "gads-br",    originalUrl: "https://mystore.com/lp/brand?utm_source=google",          isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(15),  tags: ["ads", "google"],        _count: { clicks: 2_540 } },
    { id: "dl-03", title: "Email Signature Link",                shortCode: "email-sig",  originalUrl: "https://mystore.com?ref=email-signature",                 isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(120), tags: ["email"],                _count: { clicks: 1_980 } },
    { id: "dl-04", title: "App Store Download — iOS",            shortCode: "app-ios",    originalUrl: "https://apps.apple.com/app/mystore/id123456789",          isActive: true,  isPasswordProtected: false, isFavorite: true,  expiresAt: null,         createdAt: daysAgo(50),  tags: ["app", "ios"],           _count: { clicks: 1_755 } },
    { id: "dl-05", title: "Affiliate Partner — TechBlog",        shortCode: "aff-tb",     originalUrl: "https://mystore.com?aff=techblog&sub=review",             isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(21),  tags: ["affiliate"],            _count: { clicks: 1_320 } },
    { id: "dl-06", title: "YouTube Description CTA",             shortCode: "yt-desc",    originalUrl: "https://mystore.com/shop?ref=youtube",                    isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(30),  tags: ["social", "youtube"],    _count: { clicks:   890 } },
    { id: "dl-07", title: "Twitter / X Profile Link",            shortCode: "tw-bio",     originalUrl: "https://mystore.com?ref=twitter",                         isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(60),  tags: ["social"],               _count: { clicks:   640 } },
    { id: "dl-08", title: "Google Ads — Retargeting",            shortCode: "gads-retg",  originalUrl: "https://mystore.com/lp/retarget?utm_source=google",       isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(18),  tags: ["ads", "google"],        _count: { clicks:   610 } },
    { id: "dl-09", title: "LinkedIn Company Post",               shortCode: "li-post",    originalUrl: "https://mystore.com/blog/case-study?ref=linkedin",        isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(7),   tags: ["social", "b2b"],        _count: { clicks:   580 } },
    { id: "dl-10", title: "Play Store Download — Android",       shortCode: "app-android",originalUrl: "https://play.google.com/store/apps/details?id=mystore",   isActive: true,  isPasswordProtected: false, isFavorite: true,  expiresAt: null,         createdAt: daysAgo(50),  tags: ["app", "android"],       _count: { clicks:   540 } },
    // ── Active, mid-traffic ───────────────────────────────────────────────────
    { id: "dl-11", title: "TikTok Bio Link",                     shortCode: "tt-bio",     originalUrl: "https://mystore.com?ref=tiktok",                          isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(10),  tags: ["social", "tiktok"],     _count: { clicks:   430 } },
    { id: "dl-12", title: "Facebook Ad — Lookalike Audience",    shortCode: "fb-look",    originalUrl: "https://mystore.com/lp/lookalike?utm_source=fb",          isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(12),  tags: ["ads", "facebook"],      _count: { clicks:   398 } },
    { id: "dl-13", title: "Newsletter CTA — June Edition",       shortCode: "nl-jun",     originalUrl: "https://mystore.com/newsletter-offer?m=jun24",            isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(3),   tags: ["email", "newsletter"],  _count: { clicks:   342 } },
    { id: "dl-14", title: "Affiliate Partner — DesignHub",       shortCode: "aff-dh",     originalUrl: "https://mystore.com?aff=designhub&sub=article",           isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(35),  tags: ["affiliate"],            _count: { clicks:   310 } },
    { id: "dl-15", title: "Webinar Registration Page",           shortCode: "webinar-q2", originalUrl: "https://mystore.com/webinar/q2-2024",                     isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(-20), createdAt: daysAgo(20),  tags: ["event", "webinar"],     _count: { clicks:   290 } },
    { id: "dl-16", title: "Instagram Bio Link",                  shortCode: "ig-bio",     originalUrl: "https://mystore.com?ref=instagram",                       isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(90),  tags: ["social", "instagram"],  _count: { clicks:   280 } },
    { id: "dl-17", title: "Podcast Sponsor Code",                shortCode: "pod-code",   originalUrl: "https://mystore.com/discount?code=PODCAST20",             isActive: true,  isPasswordProtected: true,  isFavorite: false, expiresAt: daysAgo(-30), createdAt: daysAgo(14),  tags: ["podcast", "promo"],     _count: { clicks:   245 } },
    { id: "dl-18", title: "Pinterest Campaign — Home Decor",     shortCode: "pin-home",   originalUrl: "https://mystore.com/category/home-decor?ref=pinterest",   isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(22),  tags: ["social", "pinterest"],  _count: { clicks:   218 } },
    { id: "dl-19", title: "Reddit AMA Promo",                    shortCode: "reddit-ama", originalUrl: "https://mystore.com/ama-deal?ref=reddit",                 isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(4),   tags: ["social", "promo"],      _count: { clicks:   195 } },
    { id: "dl-20", title: "SMS Campaign — Flash Sale",           shortCode: "sms-flash",  originalUrl: "https://mystore.com/flash-sale?utm_source=sms",           isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(-3),  createdAt: daysAgo(2),   tags: ["sms", "sale"],          _count: { clicks:   182 } },
    // ── Active, lower-traffic ─────────────────────────────────────────────────
    { id: "dl-21", title: "Product Hunt Launch",                 shortCode: "ph-launch",  originalUrl: "https://mystore.com/launch?ref=producthunt",              isActive: true,  isPasswordProtected: false, isFavorite: true,  expiresAt: daysAgo(-6),  createdAt: daysAgo(1),   tags: ["launch"],               _count: { clicks:   158 } },
    { id: "dl-22", title: "VIP Early Access",                    shortCode: "vip-ea",     originalUrl: "https://mystore.com/vip/early-access",                    isActive: true,  isPasswordProtected: true,  isFavorite: true,  expiresAt: daysAgo(-14), createdAt: daysAgo(5),   tags: ["vip", "launch"],        _count: { clicks:   134 } },
    { id: "dl-23", title: "Snapchat Story Link",                 shortCode: "snap-story", originalUrl: "https://mystore.com/new-arrivals?ref=snapchat",           isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(6),   tags: ["social", "snapchat"],   _count: { clicks:   121 } },
    { id: "dl-24", title: "Blog Post — SEO Guide",               shortCode: "blog-seo",   originalUrl: "https://mystore.com/blog/ultimate-seo-guide",             isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(40),  tags: ["content", "seo"],       _count: { clicks:   108 } },
    { id: "dl-25", title: "WhatsApp Broadcast Link",             shortCode: "wa-promo",   originalUrl: "https://mystore.com/deals?utm_source=whatsapp",           isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(8),   tags: ["messaging", "promo"],   _count: { clicks:    96 } },
    { id: "dl-26", title: "Referral Program Landing",            shortCode: "refer",      originalUrl: "https://mystore.com/referral",                            isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(55),  tags: ["referral"],             _count: { clicks:    88 } },
    { id: "dl-27", title: "Case Study — Enterprise Client",      shortCode: "cs-ent",     originalUrl: "https://mystore.com/case-studies/enterprise",             isActive: true,  isPasswordProtected: true,  isFavorite: false, expiresAt: null,         createdAt: daysAgo(28),  tags: ["b2b", "content"],       _count: { clicks:    74 } },
    { id: "dl-28", title: "Twitch Stream Donation Link",         shortCode: "twitch-don", originalUrl: "https://mystore.com/support?ref=twitch",                  isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(9),   tags: ["social", "twitch"],     _count: { clicks:    67 } },
    { id: "dl-29", title: "Newsletter CTA — May Edition",        shortCode: "nl-may",     originalUrl: "https://mystore.com/newsletter-offer?m=may24",            isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(33),  tags: ["email", "newsletter"],  _count: { clicks:    59 } },
    { id: "dl-30", title: "Discord Community Join",              shortCode: "discord",    originalUrl: "https://discord.gg/mystore-community",                    isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(65),  tags: ["community"],            _count: { clicks:    47 } },
    // ── Inactive ──────────────────────────────────────────────────────────────
    { id: "dl-31", title: "Instagram Bio Link (Old)",            shortCode: "ig-bio-old", originalUrl: "https://mystore.com?ref=ig-old",                          isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(150), tags: ["social", "instagram"],  _count: { clicks:   540 } },
    { id: "dl-32", title: "Facebook Ad — Retargeting",           shortCode: "fb-retg",    originalUrl: "https://mystore.com/lp/retarget?utm_source=fb",           isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(25),  tags: ["ads", "facebook"],      _count: { clicks:   430 } },
    { id: "dl-33", title: "Old Homepage Redirect",               shortCode: "home-v1",    originalUrl: "https://mystore.com/v1",                                  isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(300), tags: [],                       _count: { clicks:   320 } },
    { id: "dl-34", title: "Bing Ads — Product Category",         shortCode: "bing-cat",   originalUrl: "https://mystore.com/category/featured?utm_source=bing",   isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(40),  tags: ["ads", "bing"],          _count: { clicks:   210 } },
    { id: "dl-35", title: "Deprecated API Docs Link",            shortCode: "api-v1",     originalUrl: "https://docs.mystore.com/v1",                             isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(180), tags: ["docs"],                 _count: { clicks:   160 } },
    { id: "dl-36", title: "Old Pricing Page",                    shortCode: "pricing-v2", originalUrl: "https://mystore.com/pricing-2023",                        isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(220), tags: [],                       _count: { clicks:    95 } },
    { id: "dl-37", title: "Paused Influencer Campaign",          shortCode: "inf-pause",  originalUrl: "https://mystore.com/collab?utm_source=influencer",        isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(70),  tags: ["influencer"],           _count: { clicks:    48 } },
    // ── Expired ───────────────────────────────────────────────────────────────
    { id: "dl-38", title: "Black Friday 2023 — Main Promo",      shortCode: "bfri23",     originalUrl: "https://mystore.com/black-friday-2023",                   isActive: false, isPasswordProtected: false, isFavorite: true,  expiresAt: daysAgo(180), createdAt: daysAgo(210), tags: ["sale", "seasonal"],     _count: { clicks: 2_840 } },
    { id: "dl-39", title: "Expired Winter Sale",                  shortCode: "winter23",   originalUrl: "https://mystore.com/winter-sale-2023",                    isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(150), createdAt: daysAgo(200), tags: ["sale", "seasonal"],     _count: { clicks: 2_140 } },
    { id: "dl-40", title: "Spring Flash Sale — 48 Hours",         shortCode: "spring-fs",  originalUrl: "https://mystore.com/spring-flash?utm_source=email",       isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(90),  createdAt: daysAgo(100), tags: ["sale", "email"],        _count: { clicks:   980 } },
    { id: "dl-41", title: "Easter Promo 2024",                    shortCode: "easter24",   originalUrl: "https://mystore.com/easter-2024",                         isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(60),  createdAt: daysAgo(75),  tags: ["sale", "seasonal"],     _count: { clicks:   720 } },
    { id: "dl-42", title: "Valentine's Day Campaign",             shortCode: "val24",      originalUrl: "https://mystore.com/valentines-2024",                     isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(120), createdAt: daysAgo(140), tags: ["sale", "seasonal"],     _count: { clicks:   560 } },
    { id: "dl-43", title: "New Year Sale 2024",                   shortCode: "ny24-sale",  originalUrl: "https://mystore.com/new-year-2024",                       isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(160), createdAt: daysAgo(175), tags: ["sale", "seasonal"],     _count: { clicks:   415 } },
    { id: "dl-44", title: "Cyber Monday Deal",                    shortCode: "cyber23",    originalUrl: "https://mystore.com/cyber-monday-2023",                   isActive: false, isPasswordProtected: false, isFavorite: false, expiresAt: daysAgo(185), createdAt: daysAgo(215), tags: ["sale"],                 _count: { clicks:   310 } },
    // ── Recent / New ──────────────────────────────────────────────────────────
    { id: "dl-45", title: "Threads Profile Link",                 shortCode: "threads",    originalUrl: "https://mystore.com?ref=threads",                         isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(0),   tags: ["social"],               _count: { clicks:    12 } },
    { id: "dl-46", title: "Q3 Report Download",                   shortCode: "q3-report",  originalUrl: "https://mystore.com/reports/q3-2024.pdf",                 isActive: true,  isPasswordProtected: true,  isFavorite: false, expiresAt: null,         createdAt: daysAgo(1),   tags: ["b2b", "content"],       _count: { clicks:     8 } },
    { id: "dl-47", title: "New Feature Announcement",             shortCode: "feat-jul",   originalUrl: "https://mystore.com/blog/new-features-july-2024",         isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(0),   tags: ["content", "launch"],    _count: { clicks:     5 } },
    { id: "dl-48", title: "Affiliate Partner — StartupWeekly",    shortCode: "aff-sw",     originalUrl: "https://mystore.com?aff=startupweekly",                   isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(2),   tags: ["affiliate"],            _count: { clicks:    22 } },
    { id: "dl-49", title: "YouTube Shorts CTA",                   shortCode: "yt-short",   originalUrl: "https://mystore.com/trending?ref=yt-shorts",              isActive: true,  isPasswordProtected: false, isFavorite: false, expiresAt: null,         createdAt: daysAgo(1),   tags: ["social", "youtube"],    _count: { clicks:    31 } },
    { id: "dl-50", title: "Back to School Campaign",              shortCode: "b2s-24",     originalUrl: "https://mystore.com/back-to-school-2024",                 isActive: true,  isPasswordProtected: false, isFavorite: true,  expiresAt: daysAgo(-45), createdAt: daysAgo(0),   tags: ["campaign", "seasonal"], _count: { clicks:     3 } },
  ];
}

export function getDemoStats() {
  const clicksPerDay = Array.from({ length: 30 }, (_, i) => ({
    date:  isoAgo(29 - i),
    count: DAILY_PATTERN[i] ?? 0,
  }));

  // 84-day data — first 54 days quieter, last 30 matches clicksPerDay
  const clicksPerDay84 = [
    ...Array.from({ length: 54 }, (_, i) => ({
      date:  isoAgo(83 - i),
      count: Math.floor(Math.random() * 20 + 2),
    })),
    ...clicksPerDay,
  ];

  return {
    totalLinks:       47,
    totalCampaigns:   6,
    activeLinks:      38,
    inactiveLinks:    6,
    expiredLinks:     2,
    expiringSoon:     1,
    totalClicks:      8_420,
    clicksLast30Days: 628,
    clicksLast7Days:  183,
    clicksPrev7Days:  149,
    clickTrend:       23,   // +23% vs last week
    linksThisWeek:    5,

    recentLinks: [
      { id: "demo-1", title: "Summer Campaign Landing",  shortCode: "summer24",  isActive: true,  expiresAt: null,          createdAt: daysAgo(0),  _count: { clicks: 312 } },
      { id: "demo-2", title: "Product Hunt Launch",      shortCode: "ph-launch", isActive: true,  expiresAt: daysAgo(-6),   createdAt: daysAgo(1),  _count: { clicks: 94  } },
      { id: "demo-3", title: "Newsletter CTA",           shortCode: "nl-cta",    isActive: true,  expiresAt: null,          createdAt: daysAgo(3),  _count: { clicks: 57  } },
      { id: "demo-4", title: "Instagram Bio Link",       shortCode: "ig-bio",    isActive: false, expiresAt: null,          createdAt: daysAgo(5),  _count: { clicks: 210 } },
      { id: "demo-5", title: "Black Friday Promo",       shortCode: "bfri23",    isActive: false, expiresAt: daysAgo(180),  createdAt: daysAgo(8),  _count: { clicks: 1840 } },
    ],

    clicksPerDay,
    clicksPerDay84,

    clicksByDevice: [
      { device: "MOBILE",  count: 3_820 },
      { device: "DESKTOP", count: 3_110 },
      { device: "TABLET",  count:   890 },
      { device: "BOT",     count:   450 },
      { device: "UNKNOWN", count:   150 },
    ],

    clicksByBrowser: [
      { name: "Chrome",          count: 3_940 },
      { name: "Safari",          count: 2_610 },
      { name: "Firefox",         count:   820 },
      { name: "Edge",            count:   620 },
      { name: "Samsung Browser", count:   280 },
      { name: "Other",           count:   150 },
    ],

    clicksByOs: [
      { name: "Android", count: 3_800 },
      { name: "iOS",     count: 2_600 },
      { name: "Windows", count: 1_400 },
      { name: "macOS",   count:   950 },
      { name: "Linux",   count:   480 },
      { name: "Unknown", count:   220 },
    ],

    clicksByCountry: [
      { name: "United States", count: 3_210 },
      { name: "India",         count: 1_480 },
      { name: "United Kingdom",count:   920 },
      { name: "Germany",       count:   640 },
      { name: "Canada",        count:   510 },
      { name: "Australia",     count:   380 },
    ],

    topLinks: [
      { id: "demo-5", title: "Black Friday Promo",      shortCode: "bfri23",    _count: { clicks: 1_840 } },
      { id: "demo-1", title: "Summer Campaign Landing", shortCode: "summer24",  _count: { clicks: 1_210 } },
      { id: "demo-6", title: "YouTube Description CTA", shortCode: "yt-desc",   _count: { clicks:   890 } },
      { id: "demo-7", title: "Twitter / X Profile",     shortCode: "tw-bio",    _count: { clicks:   640 } },
      { id: "demo-4", title: "Instagram Bio Link",      shortCode: "ig-bio",    _count: { clicks:   210 } },
    ],

    topCampaigns: [
      { id: "camp-1", name: "Black Friday 2023",   linkCount: 8,  totalClicks: 3_420 },
      { id: "camp-2", name: "Summer Sale 2024",    linkCount: 12, totalClicks: 2_180 },
      { id: "camp-3", name: "Product Launch Q1",   linkCount: 5,  totalClicks: 1_640 },
      { id: "camp-4", name: "Newsletter Series",   linkCount: 9,  totalClicks:   820 },
      { id: "camp-5", name: "Social Media Links",  linkCount: 6,  totalClicks:   210 },
      { id: "camp-6", name: "Podcast Episodes",    linkCount: 3,  totalClicks:   150 },
    ],
  };
}

// ── Link detail demo data ─────────────────────────────────────────────────────

function makeDemoClicks(total: number) {
  const devices   = ["Mobile", "Desktop", "Tablet"];
  const browsers  = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Browser", "Other"];
  const oses      = ["Android", "iOS", "Windows", "macOS", "Linux"];
  const countries = ["US", "IN", "GB", "DE", "CA", "AU", "FR", "BR", "JP", "SG"];
  const referrers = ["google.com", "twitter.com", "instagram.com", "direct", "youtube.com", "t.co", "linkedin.com"];

  return Array.from({ length: Math.min(total, 100) }, (_, i) => ({
    id:        `dc-${i}`,
    device:    devices[i % devices.length],
    browser:   browsers[i % browsers.length],
    os:        oses[i % oses.length],
    referrer:  referrers[i % referrers.length],
    country:   countries[i % countries.length],
    createdAt: daysAgo(Math.floor(i / 4)),
  }));
}

function makeDailyClicks(days: number, peak: number) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const weekday = ((new Date().getDay() - i) % 7 + 7) % 7;
    const base = weekday === 0 || weekday === 6 ? 0.3 : 1;
    const trend = (days - i) / days;
    const count = Math.round(peak * base * trend * (0.6 + Math.random() * 0.8));
    result.push({ date: isoAgo(i), count });
  }
  return result;
}

export function getDemoLinkDetail(id: string) {
  const base = getDemoLinks().find((l) => l.id === id) ?? getDemoLinks()[0];
  return {
    ...base,
    maxClicks:          null,
    qrFgColor:          "#000000",
    qrBgColor:          "#ffffff",
    qrEcLevel:          "M" as const,
    qrMargin:           2,
    qrLogoUrl:          null,
    ogTitle:            base.title,
    ogDescription:      "Click to explore the best deals — limited time offer.",
    ogImage:            null,
    isCloaked:          false,
    hideReferrer:       false,
    redirectType:       "302" as const,
    geoTargets:         [],
    abVariants:         [],
    retargetingPixels:  [],
    clicks:             makeDemoClicks(base._count.clicks),
  };
}

export function getDemoLinkAnalytics(days: 7 | 30 | 90) {
  const peak = days === 7 ? 45 : days === 30 ? 120 : 80;
  return {
    clicksPerDay: makeDailyClicks(days, peak),
    clicksByDevice: [
      { device: "MOBILE",  count: 1_820 },
      { device: "DESKTOP", count:   980 },
      { device: "TABLET",  count:   210 },
      { device: "BOT",     count:    65 },
      { device: "UNKNOWN", count:    25 },
    ],
    clicksByBrowser: [
      { browser: "Chrome",           count: 1_540 },
      { browser: "Safari",           count:   820 },
      { browser: "Samsung Browser",  count:   310 },
      { browser: "Firefox",          count:   190 },
      { browser: "Edge",             count:   120 },
      { browser: "Other",            count:    30 },
    ],
    topReferrers: [
      { referrer: "google.com",    count: 940 },
      { referrer: "Direct",        count: 720 },
      { referrer: "instagram.com", count: 380 },
      { referrer: "twitter.com",   count: 260 },
      { referrer: "youtube.com",   count: 180 },
      { referrer: "linkedin.com",  count: 110 },
      { referrer: "t.co",          count:  80 },
      { referrer: "other",         count:  40 },
    ],
    topCountries: [
      { country: "United States",  count: 1_210 },
      { country: "India",          count:   580 },
      { country: "United Kingdom", count:   340 },
      { country: "Germany",        count:   240 },
      { country: "Canada",         count:   180 },
      { country: "Australia",      count:   130 },
      { country: "France",         count:    90 },
      { country: "Brazil",         count:    70 },
    ],
    utmSources:   [
      { label: "google",    count: 940 },
      { label: "instagram", count: 380 },
      { label: "twitter",   count: 260 },
      { label: "email",     count: 210 },
    ],
    utmMediums:   [
      { label: "cpc",      count: 940 },
      { label: "social",   count: 640 },
      { label: "email",    count: 210 },
      { label: "referral", count: 110 },
    ],
    utmCampaigns: [
      { label: "summer24",     count: 820 },
      { label: "brand-search", count: 480 },
      { label: "retargeting",  count: 310 },
      { label: "newsletter",   count: 210 },
    ],
  };
}

// ── Campaign demo data ────────────────────────────────────────────────────────

const DEMO_CAMPAIGN_LINKS = {
  "dc-01": [
    { id: "dl-01", title: "Summer Campaign Landing Page", shortCode: "summer24",   originalUrl: "https://mystore.com/summer-sale-2024",              isActive: true,  expiresAt: null,        createdAt: daysAgo(45), _count: { clicks: 3_812 } },
    { id: "dl-11", title: "TikTok Bio Link",              shortCode: "tt-bio",     originalUrl: "https://mystore.com?ref=tiktok",                    isActive: true,  expiresAt: null,        createdAt: daysAgo(10), _count: { clicks:   430 } },
    { id: "dl-13", title: "Newsletter CTA — June",        shortCode: "nl-jun",     originalUrl: "https://mystore.com/newsletter-offer?m=jun24",      isActive: true,  expiresAt: null,        createdAt: daysAgo(3),  _count: { clicks:   342 } },
    { id: "dl-16", title: "Instagram Bio Link",           shortCode: "ig-bio",     originalUrl: "https://mystore.com?ref=instagram",                 isActive: true,  expiresAt: null,        createdAt: daysAgo(90), _count: { clicks:   280 } },
    { id: "dl-18", title: "Pinterest — Home Decor",       shortCode: "pin-home",   originalUrl: "https://mystore.com/category/home-decor?ref=pinterest", isActive: true, expiresAt: null,    createdAt: daysAgo(22), _count: { clicks:   218 } },
    { id: "dl-20", title: "SMS Campaign — Flash Sale",    shortCode: "sms-flash",  originalUrl: "https://mystore.com/flash-sale?utm_source=sms",     isActive: true,  expiresAt: daysAgo(-3), createdAt: daysAgo(2),  _count: { clicks:   182 } },
    { id: "dl-07", title: "Twitter / X Profile Link",     shortCode: "tw-bio",     originalUrl: "https://mystore.com?ref=twitter",                   isActive: true,  expiresAt: null,        createdAt: daysAgo(60), _count: { clicks:   640 } },
    { id: "dl-50", title: "Back to School Campaign",      shortCode: "b2s-24",     originalUrl: "https://mystore.com/back-to-school-2024",           isActive: true,  expiresAt: daysAgo(-45), createdAt: daysAgo(0), _count: { clicks:     3 } },
  ],
  "dc-02": [
    { id: "dl-38", title: "Black Friday 2023 — Main Promo", shortCode: "bfri23",   originalUrl: "https://mystore.com/black-friday-2023",             isActive: false, expiresAt: daysAgo(180), createdAt: daysAgo(210), _count: { clicks: 2_840 } },
    { id: "dl-39", title: "Expired Winter Sale",            shortCode: "winter23", originalUrl: "https://mystore.com/winter-sale-2023",              isActive: false, expiresAt: daysAgo(150), createdAt: daysAgo(200), _count: { clicks: 2_140 } },
    { id: "dl-44", title: "Cyber Monday Deal",              shortCode: "cyber23",  originalUrl: "https://mystore.com/cyber-monday-2023",             isActive: false, expiresAt: daysAgo(185), createdAt: daysAgo(215), _count: { clicks:   310 } },
    { id: "dl-12", title: "Facebook Ad — Lookalike",        shortCode: "fb-look",  originalUrl: "https://mystore.com/lp/lookalike?utm_source=fb",   isActive: false, expiresAt: null,         createdAt: daysAgo(12),  _count: { clicks:   398 } },
    { id: "dl-19", title: "Reddit AMA Promo",               shortCode: "reddit-ama", originalUrl: "https://mystore.com/ama-deal?ref=reddit",        isActive: false, expiresAt: null,         createdAt: daysAgo(4),   _count: { clicks:   195 } },
    { id: "dl-43", title: "New Year Sale 2024",             shortCode: "ny24-sale",originalUrl: "https://mystore.com/new-year-2024",                isActive: false, expiresAt: daysAgo(160), createdAt: daysAgo(175), _count: { clicks:   415 } },
    { id: "dl-41", title: "Easter Promo 2024",              shortCode: "easter24", originalUrl: "https://mystore.com/easter-2024",                   isActive: false, expiresAt: daysAgo(60),  createdAt: daysAgo(75),  _count: { clicks:   720 } },
    { id: "dl-42", title: "Valentine's Day Campaign",       shortCode: "val24",    originalUrl: "https://mystore.com/valentines-2024",               isActive: false, expiresAt: daysAgo(120), createdAt: daysAgo(140), _count: { clicks:   560 } },
  ],
  "dc-03": [
    { id: "dl-21", title: "Product Hunt Launch",            shortCode: "ph-launch",originalUrl: "https://mystore.com/launch?ref=producthunt",        isActive: true,  expiresAt: daysAgo(-6),  createdAt: daysAgo(1),   _count: { clicks:   158 } },
    { id: "dl-22", title: "VIP Early Access",               shortCode: "vip-ea",   originalUrl: "https://mystore.com/vip/early-access",              isActive: true,  expiresAt: daysAgo(-14), createdAt: daysAgo(5),   _count: { clicks:   134 } },
    { id: "dl-02", title: "Google Ads — Brand Campaign",    shortCode: "gads-br",  originalUrl: "https://mystore.com/lp/brand?utm_source=google",    isActive: true,  expiresAt: null,         createdAt: daysAgo(15),  _count: { clicks: 2_540 } },
    { id: "dl-09", title: "LinkedIn Company Post",          shortCode: "li-post",  originalUrl: "https://mystore.com/blog/case-study?ref=linkedin",  isActive: true,  expiresAt: null,         createdAt: daysAgo(7),   _count: { clicks:   580 } },
    { id: "dl-47", title: "New Feature Announcement",       shortCode: "feat-jul", originalUrl: "https://mystore.com/blog/new-features-july-2024",   isActive: true,  expiresAt: null,         createdAt: daysAgo(0),   _count: { clicks:     5 } },
  ],
  "dc-04": [
    { id: "dl-06", title: "Newsletter CTA — June",          shortCode: "nl-jun",   originalUrl: "https://mystore.com/newsletter-offer?m=jun24",      isActive: true,  expiresAt: null,         createdAt: daysAgo(3),   _count: { clicks:   342 } },
    { id: "dl-29", title: "Newsletter CTA — May",           shortCode: "nl-may",   originalUrl: "https://mystore.com/newsletter-offer?m=may24",      isActive: true,  expiresAt: null,         createdAt: daysAgo(33),  _count: { clicks:    59 } },
    { id: "dl-03", title: "Email Signature Link",           shortCode: "email-sig",originalUrl: "https://mystore.com?ref=email-signature",           isActive: true,  expiresAt: null,         createdAt: daysAgo(120), _count: { clicks: 1_980 } },
    { id: "dl-14", title: "Affiliate — DesignHub",          shortCode: "aff-dh",   originalUrl: "https://mystore.com?aff=designhub&sub=article",     isActive: true,  expiresAt: null,         createdAt: daysAgo(35),  _count: { clicks:   310 } },
    { id: "dl-26", title: "Referral Program Landing",       shortCode: "refer",    originalUrl: "https://mystore.com/referral",                      isActive: true,  expiresAt: null,         createdAt: daysAgo(55),  _count: { clicks:    88 } },
    { id: "dl-40", title: "Spring Flash Sale — 48 Hours",   shortCode: "spring-fs",originalUrl: "https://mystore.com/spring-flash?utm_source=email", isActive: false, expiresAt: daysAgo(90),  createdAt: daysAgo(100), _count: { clicks:   980 } },
    { id: "dl-45", title: "Threads Profile Link",           shortCode: "threads",  originalUrl: "https://mystore.com?ref=threads",                   isActive: true,  expiresAt: null,         createdAt: daysAgo(0),   _count: { clicks:    12 } },
    { id: "dl-46", title: "Q3 Report Download",             shortCode: "q3-report",originalUrl: "https://mystore.com/reports/q3-2024.pdf",           isActive: true,  expiresAt: null,         createdAt: daysAgo(1),   _count: { clicks:     8 } },
    { id: "dl-49", title: "YouTube Shorts CTA",             shortCode: "yt-short", originalUrl: "https://mystore.com/trending?ref=yt-shorts",        isActive: true,  expiresAt: null,         createdAt: daysAgo(1),   _count: { clicks:    31 } },
  ],
  "dc-05": [
    { id: "dl-07", title: "Twitter / X Profile Link",       shortCode: "tw-bio",   originalUrl: "https://mystore.com?ref=twitter",                   isActive: true,  expiresAt: null,         createdAt: daysAgo(60),  _count: { clicks:   640 } },
    { id: "dl-16", title: "Instagram Bio Link",             shortCode: "ig-bio",   originalUrl: "https://mystore.com?ref=instagram",                 isActive: true,  expiresAt: null,         createdAt: daysAgo(90),  _count: { clicks:   280 } },
    { id: "dl-12", title: "TikTok Bio Link",                shortCode: "tt-bio",   originalUrl: "https://mystore.com?ref=tiktok",                    isActive: true,  expiresAt: null,         createdAt: daysAgo(10),  _count: { clicks:   430 } },
    { id: "dl-09", title: "LinkedIn Company Post",          shortCode: "li-post",  originalUrl: "https://mystore.com/blog/case-study?ref=linkedin",  isActive: true,  expiresAt: null,         createdAt: daysAgo(7),   _count: { clicks:   580 } },
    { id: "dl-28", title: "Twitch Stream Donation Link",    shortCode: "twitch-don",originalUrl:"https://mystore.com/support?ref=twitch",            isActive: true,  expiresAt: null,         createdAt: daysAgo(9),   _count: { clicks:    67 } },
    { id: "dl-23", title: "Snapchat Story Link",            shortCode: "snap-story",originalUrl:"https://mystore.com/new-arrivals?ref=snapchat",     isActive: true,  expiresAt: null,         createdAt: daysAgo(6),   _count: { clicks:   121 } },
  ],
  "dc-06": [
    { id: "dl-17", title: "Podcast Sponsor Code",           shortCode: "pod-code", originalUrl: "https://mystore.com/discount?code=PODCAST20",       isActive: true,  expiresAt: daysAgo(-30), createdAt: daysAgo(14),  _count: { clicks:   245 } },
    { id: "dl-24", title: "Blog Post — SEO Guide",          shortCode: "blog-seo", originalUrl: "https://mystore.com/blog/ultimate-seo-guide",       isActive: true,  expiresAt: null,         createdAt: daysAgo(40),  _count: { clicks:   108 } },
    { id: "dl-27", title: "Case Study — Enterprise Client", shortCode: "cs-ent",   originalUrl: "https://mystore.com/case-studies/enterprise",       isActive: true,  expiresAt: null,         createdAt: daysAgo(28),  _count: { clicks:    74 } },
  ],
} as const;

type CampaignLinks = { id: string; title: string | null; shortCode: string; originalUrl: string; isActive: boolean; expiresAt: Date | null; createdAt: Date; _count: { clicks: number } }[];

export function getDemoCampaigns() {
  return [
    { id: "dc-01", name: "Summer Sale 2024",     description: "All links for the summer sale campaign across social and email channels.", createdAt: daysAgo(50), _count: { links: DEMO_CAMPAIGN_LINKS["dc-01"].length } },
    { id: "dc-02", name: "Black Friday 2023",    description: "Seasonal Black Friday and holiday sale links — now archived.",            createdAt: daysAgo(220), _count: { links: DEMO_CAMPAIGN_LINKS["dc-02"].length } },
    { id: "dc-03", name: "Product Launch Q1",    description: "Launch-day links: Product Hunt, paid ads, and LinkedIn.",                createdAt: daysAgo(20),  _count: { links: DEMO_CAMPAIGN_LINKS["dc-03"].length } },
    { id: "dc-04", name: "Newsletter Series",    description: "CTA links embedded in every newsletter edition.",                        createdAt: daysAgo(130), _count: { links: DEMO_CAMPAIGN_LINKS["dc-04"].length } },
    { id: "dc-05", name: "Social Media Links",   description: "Bio and story links across all social platforms.",                       createdAt: daysAgo(95),  _count: { links: DEMO_CAMPAIGN_LINKS["dc-05"].length } },
    { id: "dc-06", name: "Podcast Episodes",     description: "Sponsor codes and show-notes links for podcast episodes.",               createdAt: daysAgo(45),  _count: { links: DEMO_CAMPAIGN_LINKS["dc-06"].length } },
  ];
}

export function getDemoCampaignDetail(id: string) {
  const campaigns = getDemoCampaigns();
  const base = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const links = (DEMO_CAMPAIGN_LINKS[base.id as keyof typeof DEMO_CAMPAIGN_LINKS] ?? DEMO_CAMPAIGN_LINKS["dc-01"]) as unknown as CampaignLinks;
  return {
    ...base,
    shareToken:              "demo-share-token",
    reportEmailEnabled:      true,
    reportEmailFrequency:    "weekly" as const,
    reportEmailRecipients:   ["client@example.com", "manager@example.com"],
    reportEmailLastSentAt:   daysAgo(7),
    links,
  };
}

export function getDemoClients() {
  return [
    {
      id: "cl-01",
      token: "demo-token-acme",
      clientName: "Acme Corp",
      clientEmail: "marketing@acme.com",
      createdAt: daysAgo(30),
      campaigns: [
        { campaign: { id: "dc-01", name: "Summer Sale 2024",   shareToken: "share-dc-01" } },
        { campaign: { id: "dc-03", name: "Product Launch Q1",  shareToken: "share-dc-03" } },
      ],
    },
    {
      id: "cl-02",
      token: "demo-token-bright",
      clientName: "BrightMedia Agency",
      clientEmail: "hello@brightmedia.io",
      createdAt: daysAgo(18),
      campaigns: [
        { campaign: { id: "dc-05", name: "Social Media Links", shareToken: "share-dc-05" } },
      ],
    },
    {
      id: "cl-03",
      token: "demo-token-nova",
      clientName: "Nova Retail Group",
      clientEmail: "digital@novaretail.com",
      createdAt: daysAgo(55),
      campaigns: [
        { campaign: { id: "dc-02", name: "Black Friday 2023",  shareToken: "share-dc-02" } },
        { campaign: { id: "dc-04", name: "Newsletter Series",  shareToken: "share-dc-04" } },
        { campaign: { id: "dc-06", name: "Podcast Episodes",   shareToken: "share-dc-06" } },
      ],
    },
    {
      id: "cl-04",
      token: "demo-token-peak",
      clientName: "Peak Performance Co.",
      clientEmail: "content@peakperf.co",
      createdAt: daysAgo(8),
      campaigns: [
        { campaign: { id: "dc-06", name: "Podcast Episodes",   shareToken: "share-dc-06" } },
      ],
    },
    {
      id: "cl-05",
      token: "demo-token-luxe",
      clientName: "Luxe Home Decor",
      clientEmail: "partnerships@luxehome.com",
      createdAt: daysAgo(42),
      campaigns: [
        { campaign: { id: "dc-01", name: "Summer Sale 2024",   shareToken: "share-dc-01" } },
        { campaign: { id: "dc-05", name: "Social Media Links", shareToken: "share-dc-05" } },
      ],
    },
  ];
}

export function getDemoCampaignDeviceBreakdown() {
  return [
    { device: "Mobile",  count: 4_820 },
    { device: "Desktop", count: 2_310 },
    { device: "Tablet",  count:   480 },
  ];
}

// ── Analytics page demo data ──────────────────────────────────────────────────

export function getDemoAnalytics(days: number) {
  const peak = days === 7 ? 58 : days === 30 ? 145 : 98;

  // Daily click curve
  const clicksPerDay = makeDailyClicks(days, peak);
  const totalClicks  = clicksPerDay.reduce((s, d) => s + d.count, 0);
  const uniqueClicks = Math.round(totalClicks * 0.72);

  return {
    totalClicks,
    uniqueClicks,
    clicksPerDay,
    clicksByDevice: [
      { device: "MOBILE"  as const, count: Math.round(totalClicks * 0.55) },
      { device: "DESKTOP" as const, count: Math.round(totalClicks * 0.38) },
      { device: "TABLET"  as const, count: Math.round(totalClicks * 0.07) },
    ],
    clicksByBrowser: [
      { browser: "Chrome",          count: Math.round(totalClicks * 0.49) },
      { browser: "Safari",          count: Math.round(totalClicks * 0.26) },
      { browser: "Samsung Browser", count: Math.round(totalClicks * 0.10) },
      { browser: "Firefox",         count: Math.round(totalClicks * 0.08) },
      { browser: "Edge",            count: Math.round(totalClicks * 0.05) },
      { browser: "Other",           count: Math.round(totalClicks * 0.02) },
    ],
    topReferrers: [
      { referrer: "google.com",    count: Math.round(totalClicks * 0.31) },
      { referrer: "Direct",        count: Math.round(totalClicks * 0.24) },
      { referrer: "instagram.com", count: Math.round(totalClicks * 0.13) },
      { referrer: "twitter.com",   count: Math.round(totalClicks * 0.09) },
      { referrer: "youtube.com",   count: Math.round(totalClicks * 0.07) },
      { referrer: "linkedin.com",  count: Math.round(totalClicks * 0.05) },
      { referrer: "t.co",          count: Math.round(totalClicks * 0.04) },
      { referrer: "facebook.com",  count: Math.round(totalClicks * 0.03) },
      { referrer: "reddit.com",    count: Math.round(totalClicks * 0.02) },
      { referrer: "other",         count: Math.round(totalClicks * 0.02) },
    ],
    topCountries: [
      { country: "United States", count: Math.round(totalClicks * 0.38) },
      { country: "India",         count: Math.round(totalClicks * 0.14) },
      { country: "United Kingdom",count: Math.round(totalClicks * 0.10) },
      { country: "Germany",       count: Math.round(totalClicks * 0.07) },
      { country: "Canada",        count: Math.round(totalClicks * 0.06) },
      { country: "Australia",     count: Math.round(totalClicks * 0.04) },
      { country: "France",        count: Math.round(totalClicks * 0.03) },
      { country: "Brazil",        count: Math.round(totalClicks * 0.03) },
      { country: "Japan",         count: Math.round(totalClicks * 0.02) },
      { country: "Singapore",     count: Math.round(totalClicks * 0.02) },
    ],
    topLinks: [
      { id: "dl-01", label: "Summer Campaign Landing Page", shortCode: "summer24",  count: Math.round(totalClicks * 0.24) },
      { id: "dl-02", label: "Google Ads — Brand Campaign",  shortCode: "gads-br",   count: Math.round(totalClicks * 0.16) },
      { id: "dl-03", label: "Email Signature Link",         shortCode: "email-sig", count: Math.round(totalClicks * 0.12) },
      { id: "dl-04", label: "App Store Download — iOS",     shortCode: "app-ios",   count: Math.round(totalClicks * 0.10) },
      { id: "dl-05", label: "Affiliate Partner — TechBlog", shortCode: "aff-tb",    count: Math.round(totalClicks * 0.08) },
      { id: "dl-11", label: "Google Ads — Retargeting",     shortCode: "gads-retg", count: Math.round(totalClicks * 0.06) },
      { id: "dl-06", label: "YouTube Description CTA",      shortCode: "yt-desc",   count: Math.round(totalClicks * 0.05) },
      { id: "dl-07", label: "Twitter / X Profile Link",     shortCode: "tw-bio",    count: Math.round(totalClicks * 0.04) },
      { id: "dl-10", label: "Play Store Download",          shortCode: "app-android",count: Math.round(totalClicks * 0.03) },
      { id: "dl-09", label: "LinkedIn Company Post",        shortCode: "li-post",   count: Math.round(totalClicks * 0.02) },
    ],
  };
}

// ── Client portal demo data ───────────────────────────────────────────────────

const DEMO_PORTAL_CLIENTS: Record<string, {
  id: string; clientName: string; clientEmail: string;
  workspace: { id: string; name: string; brandLogoUrl: string | null; brandColor: string | null; hideBranding: boolean };
  campaigns: { campaign: { id: string; name: string; description: string | null; shareToken: string;
    links: { id: string; isActive: boolean; expiresAt: Date | null; _count: { clicks: number } }[] } }[];
}> = {
  "demo-token-acme": {
    id: "cl-01", clientName: "Acme Corp", clientEmail: "marketing@acme.com",
    workspace: { id: "demo-workspace", name: "MyStore", brandLogoUrl: null, brandColor: null, hideBranding: false },
    campaigns: [
      { campaign: { id: "dc-01", name: "Summer Sale 2024",  description: "All links for the summer sale campaign across social and email channels.", shareToken: "share-dc-01",
          links: DEMO_CAMPAIGN_LINKS["dc-01"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
      { campaign: { id: "dc-03", name: "Product Launch Q1", description: "Launch-day links: Product Hunt, paid ads, and LinkedIn.", shareToken: "share-dc-03",
          links: DEMO_CAMPAIGN_LINKS["dc-03"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
    ],
  },
  "demo-token-bright": {
    id: "cl-02", clientName: "BrightMedia Agency", clientEmail: "hello@brightmedia.io",
    workspace: { id: "demo-workspace", name: "MyStore", brandLogoUrl: null, brandColor: null, hideBranding: false },
    campaigns: [
      { campaign: { id: "dc-05", name: "Social Media Links", description: "Bio and story links across all social platforms.", shareToken: "share-dc-05",
          links: DEMO_CAMPAIGN_LINKS["dc-05"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
    ],
  },
  "demo-token-nova": {
    id: "cl-03", clientName: "Nova Retail Group", clientEmail: "digital@novaretail.com",
    workspace: { id: "demo-workspace", name: "MyStore", brandLogoUrl: null, brandColor: null, hideBranding: false },
    campaigns: [
      { campaign: { id: "dc-02", name: "Black Friday 2023",  description: "Seasonal Black Friday and holiday sale links — now archived.", shareToken: "share-dc-02",
          links: DEMO_CAMPAIGN_LINKS["dc-02"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
      { campaign: { id: "dc-04", name: "Newsletter Series",  description: "CTA links embedded in every newsletter edition.", shareToken: "share-dc-04",
          links: DEMO_CAMPAIGN_LINKS["dc-04"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
      { campaign: { id: "dc-06", name: "Podcast Episodes",   description: "Sponsor codes and show-notes links for podcast episodes.", shareToken: "share-dc-06",
          links: DEMO_CAMPAIGN_LINKS["dc-06"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
    ],
  },
  "demo-token-peak": {
    id: "cl-04", clientName: "Peak Performance Co.", clientEmail: "content@peakperf.co",
    workspace: { id: "demo-workspace", name: "MyStore", brandLogoUrl: null, brandColor: null, hideBranding: false },
    campaigns: [
      { campaign: { id: "dc-06", name: "Podcast Episodes", description: "Sponsor codes and show-notes links for podcast episodes.", shareToken: "share-dc-06",
          links: DEMO_CAMPAIGN_LINKS["dc-06"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
    ],
  },
  "demo-token-luxe": {
    id: "cl-05", clientName: "Luxe Home Decor", clientEmail: "partnerships@luxehome.com",
    workspace: { id: "demo-workspace", name: "MyStore", brandLogoUrl: null, brandColor: null, hideBranding: false },
    campaigns: [
      { campaign: { id: "dc-01", name: "Summer Sale 2024",   description: "All links for the summer sale campaign across social and email channels.", shareToken: "share-dc-01",
          links: DEMO_CAMPAIGN_LINKS["dc-01"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
      { campaign: { id: "dc-05", name: "Social Media Links", description: "Bio and story links across all social platforms.", shareToken: "share-dc-05",
          links: DEMO_CAMPAIGN_LINKS["dc-05"].map((l) => ({ id: l.id, isActive: l.isActive, expiresAt: l.expiresAt, _count: { clicks: l._count.clicks } })) } },
    ],
  },
};

export function getDemoClientPortal(token: string) {
  return DEMO_PORTAL_CLIENTS[token] ?? DEMO_PORTAL_CLIENTS["demo-token-acme"];
}

// ── Shared report page demo data ──────────────────────────────────────────────

const SHARE_TOKEN_TO_ID: Record<string, string> = {
  "share-dc-01": "dc-01",
  "share-dc-02": "dc-02",
  "share-dc-03": "dc-03",
  "share-dc-04": "dc-04",
  "share-dc-05": "dc-05",
  "share-dc-06": "dc-06",
};

export function getDemoReportData(shareToken: string) {
  const id = SHARE_TOKEN_TO_ID[shareToken] ?? "dc-01";
  const campaign = getDemoCampaignDetail(id);
  return {
    id:          campaign.id,
    name:        campaign.name,
    description: campaign.description,
    shareToken:  campaign.shareToken,
    createdAt:   campaign.createdAt,
    workspace:   { brandLogoUrl: null, brandColor: null, hideBranding: false },
    links: ((DEMO_CAMPAIGN_LINKS as Record<string, typeof DEMO_CAMPAIGN_LINKS[keyof typeof DEMO_CAMPAIGN_LINKS]>)[id] ?? []).map((l) => ({
      id:        l.id,
      title:     l.title,
      shortCode: l.shortCode,
      isActive:  l.isActive,
      expiresAt: l.expiresAt,
      _count:    { clicks: l._count.clicks },
    })),
  };
}

export function getDemoReportDeviceBreakdown() {
  return [
    { device: "MOBILE"  as const, _count: { id: 4_820 } },
    { device: "DESKTOP" as const, _count: { id: 2_310 } },
    { device: "TABLET"  as const, _count: { id:   480 } },
  ];
}
