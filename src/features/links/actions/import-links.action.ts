"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan, canCreateLink, PLAN_LIMITS, getUserUsage } from "@/lib/subscription";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { generateShortCode, isReservedSlug } from "@/lib/slug";
import { validateSafeUrl } from "@/server/services/url-safety.service";
import { enforceDemoRedirect } from "@/server/services/demo-guard.service";
import { checkImportRateLimit, recordImportAttempt } from "@/lib/rate-limit";

const MAX_IMPORT_ROWS = 1000;

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
  if (!session?.user?.id) return { error: SESSION_EXPIRED_MESSAGE };

  const userId = session.user.id;

  let allowed: boolean;
  let workspaceId: string;
  let plan: Awaited<ReturnType<typeof getUserPlan>>;
  let currentCount: number;
  try {
    allowed = await checkImportRateLimit(userId);
    if (!allowed) return { error: "Too many imports. Please try again in an hour." };

    workspaceId = await ensureWorkspace(userId);
    plan = await getUserPlan(userId);
    const usage = await getUserUsage(userId);
    currentCount = plan === "free"
      ? usage.linksCreated
      : await prisma.link.count({ where: { userId } });
  } catch {
    return { error: "Something went wrong starting the import. Please try again." };
  }

  const limit = PLAN_LIMITS[plan].links;

  // Parse CSV
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { error: "The CSV file appears to be empty." };

  // Detect header row
  const firstRow = rows[0].map((h) => h.toLowerCase());
  const hasHeader = firstRow.includes("url") || firstRow.includes("originalurl");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  if (dataRows.length > MAX_IMPORT_ROWS) {
    return { error: `CSV files are limited to ${MAX_IMPORT_ROWS} rows. Please split this into smaller files.` };
  }

  await recordImportAttempt(userId);

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
      safeUrl = validateSafeUrl(await enforceDemoRedirect(userId, rawUrl));
    } catch (e) {
      skipped.push({ row: rowNum, url: rawUrl, reason: e instanceof Error ? e.message : "Invalid URL" });
      continue;
    }

    // Resolve short code and create the link — wrapped per-row so a transient
    // DB error on one row (e.g. a lock timeout) skips just that row instead of
    // aborting the whole import with no result and no way to know how many of
    // the rows before it actually got created.
    try {
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
    } catch {
      skipped.push({ row: rowNum, url: rawUrl, reason: "Unexpected error creating this link" });
    }
  }

  revalidatePath("/dashboard/links");
  return { created: created.length, skipped };
}
