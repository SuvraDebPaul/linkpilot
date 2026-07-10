import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.EMAIL_FROM ?? "LinkPilot <noreply@yourdomain.com>";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://linkpilot.app";

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function emailLayout(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="x-apple-disable-message-reformatting" />
  ${previewText ? `<meta name="description" content="${escapeHtml(previewText)}" />` : ""}
  <title>LinkPilot</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <!-- Preheader (hidden preview text) -->
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(previewText)}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

          <!-- Logo header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center">
              <a href="${APP_URL}" style="text-decoration:none">
                <span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Link<span style="color:#0d9488">Pilot</span></span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);padding:40px 40px 36px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.6">
              <p style="margin:0">This is a transactional email from <a href="${APP_URL}" style="color:#0d9488;text-decoration:none">LinkPilot</a>.</p>
              <p style="margin:4px 0 0">If you didn't request this, you can safely ignore it.</p>
              <p style="margin:12px 0 0;color:#cbd5e1">© ${new Date().getFullYear()} LinkPilot. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ctaButton(label: string, href: string, color = "#0d9488"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0">
    <tr>
      <td>
        <a href="${href}"
           style="display:inline-block;padding:13px 28px;background:${color};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:10px;letter-spacing:0.01em">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:7px 0;color:#64748b;font-size:14px;width:120px;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:7px 0;color:#0f172a;font-size:14px;vertical-align:top">${escapeHtml(value)}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Email: verify email address
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Verify your email</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">
      Thanks for signing up for LinkPilot! Click the button below to verify your email address and activate your account.
    </p>
    ${ctaButton("Verify email address", verifyUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
      This link expires in <strong>24 hours</strong>. If you didn't create a LinkPilot account, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;color:#cbd5e1;font-size:12px;word-break:break-all">
      Or copy this link: <span style="color:#64748b">${verifyUrl}</span>
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email – LinkPilot",
    html: emailLayout(content, "Click to verify your email address and activate your LinkPilot account."),
  });
}

// ---------------------------------------------------------------------------
// Email: password reset
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Reset your password</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">
      We received a request to reset the password for your LinkPilot account. Click the button below to choose a new password.
    </p>
    ${ctaButton("Reset password", resetUrl, "#0f172a")}
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:4px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
        This link expires in <strong>1 hour</strong>. If you didn't request a password reset, your account is safe — no changes were made.
      </p>
      <p style="margin:12px 0 0;color:#cbd5e1;font-size:12px;word-break:break-all">
        Or copy this link: <span style="color:#64748b">${resetUrl}</span>
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password – LinkPilot",
    html: emailLayout(content, "A password reset was requested for your LinkPilot account."),
  });
}

// ---------------------------------------------------------------------------
// Email: workspace invite
// ---------------------------------------------------------------------------

export async function sendWorkspaceInviteEmail(
  to: string,
  workspaceName: string,
  token: string,
  inviterName: string,
) {
  const acceptUrl = `${APP_URL}/api/workspace/accept-invite?token=${token}`;

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">You're invited!</h1>
    <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      <strong style="color:#0f172a">${escapeHtml(inviterName)}</strong> has invited you to join
      <strong style="color:#0f172a">${escapeHtml(workspaceName)}</strong> on LinkPilot —
      a shared workspace for managing short links, QR codes, campaigns, and analytics.
    </p>
    ${ctaButton("Accept invitation", acceptUrl)}
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:4px">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
        This invite expires in <strong>7 days</strong>. If you weren't expecting this invitation, you can ignore it — no account changes will be made.
      </p>
      <p style="margin:12px 0 0;color:#cbd5e1;font-size:12px;word-break:break-all">
        Or copy this link: <span style="color:#64748b">${acceptUrl}</span>
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} invited you to "${workspaceName}" on LinkPilot`,
    html: emailLayout(content, `${inviterName} invited you to join ${workspaceName} on LinkPilot.`),
  });
}

// ---------------------------------------------------------------------------
// Email: client portal invite
// ---------------------------------------------------------------------------

export async function sendClientPortalInviteEmail({
  to,
  clientName,
  workspaceName,
  portalUrl,
  brandLogoUrl,
  brandColor,
}: {
  to: string;
  clientName: string;
  workspaceName: string;
  portalUrl: string;
  brandLogoUrl?: string | null;
  brandColor?: string | null;
}) {
  const accent = brandColor ?? "#0d9488";

  const logoHtml = brandLogoUrl
    ? `<img src="${brandLogoUrl}" alt="Logo" style="max-height:36px;max-width:160px;object-fit:contain" />`
    : `<span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Link<span style="color:#0d9488">Pilot</span></span>`;

  const content = `
    <div style="margin-bottom:24px">${logoHtml}</div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">
      Hi ${escapeHtml(clientName)} 👋
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">
      <strong>${escapeHtml(workspaceName)}</strong> has shared your campaign reports with you.
      Click the button below to view your personalised client portal — no login required.
    </p>

    ${ctaButton("View my portal →", portalUrl, accent)}

    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
      This portal link is private — please don't share it publicly.
      If you didn't expect this email, you can safely ignore it.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${workspaceName} shared your campaign portal`,
    html: emailLayout(content, `View your campaign reports from ${workspaceName}`),
  });
}

// ---------------------------------------------------------------------------
// Email: scheduled campaign report
// ---------------------------------------------------------------------------

export async function sendCampaignReportEmail({
  to,
  campaignName,
  reportUrl,
  periodLabel,
  totalClicks,
  topLinks,
  brandLogoUrl,
  brandColor,
}: {
  to: string;
  campaignName: string;
  reportUrl: string;
  periodLabel: string;
  totalClicks: number;
  topLinks: { title: string; clicks: number }[];
  brandLogoUrl?: string | null;
  brandColor?: string | null;
}) {
  const accent = brandColor ?? "#0d9488";

  const logoHtml = brandLogoUrl
    ? `<img src="${brandLogoUrl}" alt="Logo" style="max-height:36px;max-width:160px;object-fit:contain" />`
    : `<span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Link<span style="color:#0d9488">Pilot</span></span>`;

  const topLinksHtml = topLinks.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;border-radius:10px;overflow:hidden;border:1px solid #f1f5f9">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Link</th>
            <th style="padding:8px 14px;text-align:right;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Clicks</th>
          </tr>
        </thead>
        <tbody>
          ${topLinks.map((l, i) => `
          <tr style="border-top:1px solid #f1f5f9${i === 0 ? ";background:#fafafa" : ""}">
            <td style="padding:10px 14px;font-size:13px;color:#0f172a;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(l.title)}</td>
            <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#0f172a;text-align:right">${l.clicks.toLocaleString()}</td>
          </tr>`).join("")}
        </tbody>
      </table>`
    : `<p style="margin:12px 0 0;color:#94a3b8;font-size:13px">No clicks recorded this period.</p>`;

  const content = `
    <!-- Branded header -->
    <div style="margin-bottom:24px">${logoHtml}</div>

    <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">
      ${escapeHtml(campaignName)}
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#94a3b8">${escapeHtml(periodLabel)}</p>

    <!-- Big stat -->
    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:20px;text-align:center">
      <p style="margin:0;font-size:13px;color:#64748b;font-weight:500">Total clicks</p>
      <p style="margin:6px 0 0;font-size:40px;font-weight:800;color:#0f172a;letter-spacing:-1px">${totalClicks.toLocaleString()}</p>
    </div>

    <!-- Top links -->
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f172a">Top links</p>
    ${topLinksHtml}

    ${ctaButton("View full report →", reportUrl, accent)}

    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
      You're receiving this because someone scheduled campaign report emails through LinkPilot.
      To stop receiving these emails, ask the campaign owner to remove your address.
    </p>
  `;

  const subject = `${campaignName} — ${periodLabel} report`;
  const preview = `${totalClicks.toLocaleString()} clicks ${periodLabel.toLowerCase()} · ${campaignName}`;

  return resend.emails.send({ from: FROM, to, subject, html: emailLayout(content, preview) });
}

// ---------------------------------------------------------------------------
// Email: monthly account activity report
// ---------------------------------------------------------------------------

export async function sendMonthlyAccountReportEmail({
  to,
  name,
  totalLinks,
  totalCampaigns,
  clicksLast30Days,
  newLinksLast30Days,
}: {
  to: string;
  name?: string | null;
  totalLinks: number;
  totalCampaigns: number;
  clicksLast30Days: number;
  newLinksLast30Days: number;
}) {
  const dashUrl = `${APP_URL}/dashboard/analytics`;

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Your monthly LinkPilot report</h1>
    <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>

    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:20px;text-align:center">
      <p style="margin:0;font-size:13px;color:#64748b;font-weight:500">Clicks in the last 30 days</p>
      <p style="margin:6px 0 0;font-size:40px;font-weight:800;color:#0f172a;letter-spacing:-1px">${clicksLast30Days.toLocaleString()}</p>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px">
      ${infoRow("Total links", totalLinks.toLocaleString())}
      ${infoRow("Total campaigns", totalCampaigns.toLocaleString())}
      ${infoRow("New links (30d)", newLinksLast30Days.toLocaleString())}
    </table>

    ${ctaButton("View full analytics →", dashUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px">
      You're receiving this because monthly reports are turned on in your
      <a href="${APP_URL}/dashboard/settings" style="color:#0d9488;text-decoration:none">account settings</a>.
    </p>
  `;

  const subject = "Your monthly LinkPilot report";
  const preview = `${clicksLast30Days.toLocaleString()} clicks in the last 30 days across ${totalLinks.toLocaleString()} links.`;

  return resend.emails.send({ from: FROM, to, subject, html: emailLayout(content, preview) });
}

// ---------------------------------------------------------------------------
// Onboarding email sequence
// ---------------------------------------------------------------------------

function greeting(name?: string | null) {
  return name ? `Hi ${escapeHtml(name)},` : "Hi there,";
}

function step(n: string, title: string, body: string) {
  return `
    <tr>
      <td style="padding:10px 0">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:32px;vertical-align:top;padding-top:2px">
              <span style="display:inline-block;width:24px;height:24px;background:#f0fdfa;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0d9488">${n}</span>
            </td>
            <td style="padding-left:10px">
              <p style="margin:0 0 2px;font-weight:600;color:#0f172a;font-size:14px">${title}</p>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">${body}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// Day 1 — Welcome + first steps
export async function sendOnboardingDay1Email(to: string, name?: string | null) {
  const dashUrl = `${APP_URL}/dashboard`;
  const demoUrl = `${APP_URL}/demo`;

  const content = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Your account is ready.</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>
    <p style="margin:8px 0 24px;color:#64748b;font-size:15px;line-height:1.6">
      Welcome to LinkPilot. Your free account gives you 50 permanent links,
      2 campaigns, and basic analytics — no credit card, no expiry.
      Here&apos;s how to get value fast:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #f1f5f9;margin-bottom:8px">
      ${step("1", "Create a short link for each channel", "Paste any URL, pick a slug, and get a trackable link in seconds. Make one for Instagram, one for your email, one for any Google Ad.")}
      ${step("2", "Group them into a campaign", "Campaigns let you see all your channels side-by-side. You&apos;ll know exactly which one drove the most clicks.")}
      ${step("3", "Share the results", "Send your campaign link to a client — they see live results without needing to log in. No PDF, no screenshot.")}
    </table>

    ${ctaButton("Go to your dashboard →", dashUrl)}

    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
      Not sure what a campaign report looks like?
      <a href="${demoUrl}" style="color:#0d9488;text-decoration:none">See a live example →</a>
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Your LinkPilot account is ready — start here",
    html: emailLayout(content, "50 links, 2 campaigns, basic analytics. No card needed. Here's how to get started."),
  });
}

// Day 3 — Campaign pitch (no campaigns yet) or client report pitch (has campaigns)
export async function sendOnboardingDay3Email(
  to: string,
  name: string | null | undefined,
  hasCampaigns: boolean,
) {
  const campaignsUrl = `${APP_URL}/dashboard/campaigns`;
  const demoUrl = `${APP_URL}/demo`;

  const content = hasCampaigns
    ? `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Have you shared a report with a client yet?</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>
    <p style="margin:8px 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      You&apos;ve got a campaign set up — nice. The next step is sending the results to someone.
    </p>
    <div style="background:#f0fdfa;border-left:3px solid #0d9488;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px">
      <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6">
        Open your campaign → copy the shareable report link → send it to your client.<br/>
        <strong>They open it in their browser — no login needed.</strong>
      </p>
    </div>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6">
      That&apos;s the difference between a freelancer who sends a screenshot and one who sends
      a live report. The second one charges more.
    </p>
    ${ctaButton("Open your campaign →", campaignsUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
      See what the client view looks like: <a href="${demoUrl}" style="color:#0d9488;text-decoration:none">view example report →</a>
    </p>
  `
    : `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">One link per channel changes everything.</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>
    <p style="margin:8px 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      You&apos;ve created links — now group them into a campaign. Here&apos;s why it matters:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:20px">
      <tbody>
        ${[
          ["Instagram", "741 clicks"],
          ["Email newsletter", "392 clicks"],
          ["Google Ad", "1,088 clicks"],
          ["Printed QR flyer", "156 clicks"],
        ].map(([ch, val]) => `
        <tr>
          <td style="padding:9px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">${ch}</td>
          <td style="padding:9px 16px;font-size:13px;font-weight:600;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9">${val}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6">
      That&apos;s what a campaign shows you. One dashboard, every channel, no guessing.
      Your free account includes 2 campaigns — create your first one in under a minute.
    </p>
    ${ctaButton("Create your first campaign →", campaignsUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
      See a finished campaign report: <a href="${demoUrl}" style="color:#0d9488;text-decoration:none">view live example →</a>
    </p>
  `;

  const subject = hasCampaigns
    ? "Have you shared a campaign report with a client yet?"
    : "One link per channel changes everything";

  const preview = hasCampaigns
    ? "Your campaign is ready. Here's how to share the results with a client."
    : "Which channel drives the most clicks? You can find out in 60 seconds.";

  return resend.emails.send({ from: FROM, to, subject, html: emailLayout(content, preview) });
}

// Day 7 — Upgrade pitch (active) or re-engagement (inactive)
export async function sendOnboardingDay7Email(
  to: string,
  name: string | null | undefined,
  linksCreated: number,
  campaignsCreated: number,
) {
  const dashUrl = `${APP_URL}/dashboard`;
  const pricingUrl = `${APP_URL}/pricing`;
  const linksUrl = `${APP_URL}/dashboard/links`;

  const isActive = linksCreated > 0;

  const content = isActive
    ? `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">A week with LinkPilot — here&apos;s what Starter adds.</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>
    <p style="margin:8px 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      You&apos;ve created <strong style="color:#0f172a">${linksCreated} link${linksCreated !== 1 ? "s" : ""}</strong>${campaignsCreated > 0 ? ` and <strong style="color:#0f172a">${campaignsCreated} campaign${campaignsCreated !== 1 ? "s" : ""}</strong>` : ""} on your free plan.
      When you&apos;re ready to do more, Starter unlocks:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px">
      ${[
        ["500 links", "10× more than free — enough for every campaign you run"],
        ["100 campaigns", "One per client, one per project, one per channel — go all in"],
        ["30-day analytics", "See trends over a month, not just 7 days"],
        ["Shareable summaries", "Send clients a link to the campaign results — no login"],
      ].map(([title, desc]) => `
      <tr>
        <td style="padding:8px 0;vertical-align:top">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:16px;color:#0d9488;font-size:16px;line-height:1;vertical-align:top;padding-top:1px">✓</td>
              <td style="padding-left:10px">
                <p style="margin:0 0 1px;font-weight:600;font-size:14px;color:#0f172a">${title}</p>
                <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join("")}
    </table>

    <div style="background:#f0fdfa;border-radius:10px;padding:14px 16px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;color:#0f172a;font-weight:600">Starter is $5/month.</p>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.6">Less than one coffee. One client campaign pays for months of it.</p>
    </div>

    ${ctaButton("Upgrade to Starter — $5/mo →", pricingUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px">
      Happy on the free plan for now? No problem —
      <a href="${dashUrl}" style="color:#0d9488;text-decoration:none">continue using your dashboard →</a>
    </p>
  `
    : `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.3px">Your LinkPilot account is waiting.</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;line-height:1.6">${greeting(name)}</p>
    <p style="margin:8px 0 20px;color:#64748b;font-size:15px;line-height:1.6">
      You signed up a week ago but haven&apos;t created your first link yet. That&apos;s fine —
      we&apos;ll make it easy to start in the next 5 minutes:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #f1f5f9;margin-bottom:8px">
      ${step("1", "Go to Links → New link", "Paste any URL — a product page, a blog post, a booking form.")}
      ${step("2", "Pick a short slug", "Something like <em>your-name/offer</em> or leave it auto-generated.")}
      ${step("3", "Share it anywhere", "You&apos;ll see every click in your dashboard. No extra setup.")}
    </table>

    ${ctaButton("Create your first link →", linksUrl)}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6">
      Your free account stays active — 50 permanent links, no expiry, no card needed.
      Just come back whenever you&apos;re ready.
    </p>
  `;

  const subject = isActive
    ? "A week with LinkPilot — here's what Starter adds"
    : "Your LinkPilot account is waiting — 5 minutes to your first link";

  const preview = isActive
    ? `You've created ${linksCreated} link${linksCreated !== 1 ? "s" : ""}. Here's what upgrading to Starter unlocks.`
    : "You signed up a week ago. Here's how to get value from your account in 5 minutes.";

  return resend.emails.send({ from: FROM, to, subject, html: emailLayout(content, preview) });
}
