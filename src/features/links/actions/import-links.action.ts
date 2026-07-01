"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, canCreateLink, PLAN_LIMITS, getUserUsage } from "@/lib/subscription";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { generateShortCode, isReservedSlug } from "@/lib/slug";
import { validateSafeUrl } from "@/server/services/url-safety.service";

export type ImportRow = {
  url: string;
  title?: string;
  slug?: string;
  tags?: string;
};

export type ImportResult = {
  created: number;
  skipped: { row: number; url: string; reason: string }[];
};

// Minimal CSV parser: handles quoted fields containing commas and newlines
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field.trim()); field = ""; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = "";
      } else { field += ch; }
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

async function generateUniqueShortCode(): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    const code = generateShortCode(7);
    if (isReservedSlug(code)) continue;
    const exists = await prisma.link.findUnique({ where: { shortCode: code }, select: { id: true } });
    if (!exists) {
      const guestExists = await prisma.guestLink.findUnique({ where: { shortCode: code }, select: { id: true } });
      if (!guestExists) return code;
    }
  }
  return null;
}

export async function importLinksAction(csvText: string): Promise<ImportResult | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;
  const workspaceId = await ensureWorkspace(userId);

  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan].links;
  const usage = await getUserUsage(userId);

  let currentCount = plan === "free"
    ? usage.linksCreated
    : await prisma.link.count({ where: { userId } });

  // Parse CSV
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { error: "The CSV file appears to be empty." };

  // Detect header row
  const firstRow = rows[0].map((h) => h.toLowerCase());
  const hasHeader = firstRow.includes("url") || firstRow.includes("originalurl");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const urlIdx = hasHeader ? (firstRow.indexOf("url") !== -1 ? firstRow.indexOf("url") : firstRow.indexOf("originalurl")) : 0;
  const titleIdx = hasHeader ? firstRow.indexOf("title") : 1;
  const slugIdx = hasHeader ? firstRow.indexOf("slug") : -1;
  const tagsIdx = hasHeader ? firstRow.indexOf("tags") : -1;

  const created: string[] = [];
  const skipped: ImportResult["skipped"] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const rowNum = hasHeader ? i + 2 : i + 1;
    const rawUrl = r[urlIdx]?.trim() ?? "";

    if (!rawUrl) {
      skipped.push({ row: rowNum, url: rawUrl, reason: "Missing URL" });
      continue;
    }

    // Plan limit check
    if (isFinite(limit) && !canCreateLink(plan, currentCount)) {
      skipped.push({ row: rowNum, url: rawUrl, reason: `Plan limit of ${limit} links reached` });
      continue;
    }

    // Validate URL
    let safeUrl: string;
    try {
      safeUrl = validateSafeUrl(rawUrl);
    } catch (e) {
      skipped.push({ row: rowNum, url: rawUrl, reason: e instanceof Error ? e.message : "Invalid URL" });
      continue;
    }

    // Resolve short code
    const rawSlug = slugIdx !== -1 ? r[slugIdx]?.trim() : "";
    let shortCode: string | null = null;

    if (rawSlug) {
      if (isReservedSlug(rawSlug)) {
        skipped.push({ row: rowNum, url: rawUrl, reason: `Slug "${rawSlug}" is reserved` });
        continue;
      }
      const taken = await prisma.link.findUnique({ where: { shortCode: rawSlug }, select: { id: true } });
      if (taken) {
        skipped.push({ row: rowNum, url: rawUrl, reason: `Slug "${rawSlug}" is already taken` });
        continue;
      }
      shortCode = rawSlug;
    } else {
      shortCode = await generateUniqueShortCode();
      if (!shortCode) {
        skipped.push({ row: rowNum, url: rawUrl, reason: "Could not generate a unique slug" });
        continue;
      }
    }

    const title = titleIdx !== -1 ? r[titleIdx]?.trim() || null : null;
    const tags = tagsIdx !== -1 && r[tagsIdx]
      ? r[tagsIdx].split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    await prisma.link.create({
      data: { userId, workspaceId, originalUrl: safeUrl, shortCode, title, tags },
    });

    // Track lifetime counter (free plan)
    await prisma.user.update({
      where: { id: userId },
      data: { totalLinksCreated: { increment: 1 } },
    });

    currentCount++;
    created.push(shortCode);
  }

  revalidatePath("/dashboard/links");
  return { created: created.length, skipped };
}
