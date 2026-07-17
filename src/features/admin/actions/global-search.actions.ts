"use server";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";

export type GlobalSearchResult = {
  users: { id: string; email: string; name: string | null }[];
  workspaces: { id: string; name: string; slug: string }[];
  links: { id: string; shortCode: string; originalUrl: string }[];
};

const EMPTY: GlobalSearchResult = { users: [], workspaces: [], links: [] };

// A quick "jump straight to this specific record" search across the three
// entities support most often needs to look up, rather than three separate
// searches on three separate list pages.
export async function globalSearchAction(query: string): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (q.length < 2) return EMPTY;

  try {
    await requireSuperAdmin();
  } catch {
    return EMPTY;
  }

  const [users, workspaces, links] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
      select: { id: true, email: true, name: true },
      take: 5,
    }),
    prisma.workspace.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, slug: true },
      take: 5,
    }),
    prisma.link.findMany({
      where: { shortCode: { contains: q, mode: "insensitive" } },
      select: { id: true, shortCode: true, originalUrl: true },
      take: 5,
    }),
  ]);

  return { users, workspaces, links };
}
