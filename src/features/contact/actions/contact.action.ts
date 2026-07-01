"use server";

import { z } from "zod";
import { resend } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  teamSize: z.string().optional(),
  useCase: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactResult =
  | { success: true; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

const useCaseLabels: Record<string, string> = {
  "agency-plan": "Agency plan inquiry",
  "client-reporting": "Client-ready reports",
  "branded-domains": "Branded short links",
  "team-workspaces": "Team workspaces",
  "campaign-management": "Campaign management",
  "other": "Something else",
};

export async function contactAction(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your input.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, company, teamSize, useCase, message } = parsed.data;
  const useCaseLabel = useCase ? (useCaseLabels[useCase] ?? useCase) : null;

  function row(label: string, value: string) {
    return `<tr><td style="padding:7px 0;color:#64748b;font-size:14px;width:120px;vertical-align:top">${label}</td><td style="padding:7px 0;color:#0f172a;font-size:14px;vertical-align:top">${value}</td></tr>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td style="padding-bottom:24px;text-align:center">
        <span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px">Link<span style="color:#0d9488">Pilot</span></span>
      </td></tr>
      <tr><td style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.08);padding:36px 40px">
        <h1 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#0f172a">New agency inquiry</h1>
        <p style="margin:0 0 20px;color:#64748b;font-size:14px">Submitted via the LinkPilot contact form.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${row("Name", name)}
          ${row("Email", `<a href="mailto:${email}" style="color:#0d9488;text-decoration:none">${email}</a>`)}
          ${company ? row("Company", company) : ""}
          ${teamSize ? row("Team size", teamSize) : ""}
          ${useCaseLabel ? row("Use case", useCaseLabel) : ""}
        </table>
        <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:10px;border-left:3px solid #0d9488">
          <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8">Reply directly to this email to respond to ${name}.</p>
      </td></tr>
      <tr><td style="padding-top:20px;text-align:center;color:#94a3b8;font-size:12px">
        © ${new Date().getFullYear()} LinkPilot
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "LinkPilot <noreply@yourdomain.com>",
      to: process.env.CONTACT_EMAIL ?? "hello@linkpilot.app",
      replyTo: email,
      subject: `Agency inquiry from ${name}${company ? ` (${company})` : ""}`,
      html,
    });
  } catch {
    return { success: false, message: "Failed to send message. Please email us directly." };
  }

  return { success: true, message: "Message sent! We'll get back to you within one business day." };
}
