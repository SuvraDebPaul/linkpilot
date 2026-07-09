"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Link2,
  ExternalLink,
  Search,
  PenLine,
  BarChart2,
  Copy,
  Calendar,
  Tag,
  Lock,
  Star,
  Globe,
  FolderKanban,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  CopyPlus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  deleteLinkAction,
  updateLinkAction,
  duplicateLinkAction,
  bulkDeleteLinksAction,
  bulkToggleActiveAction,
  toggleFavoriteLinkAction,
} from "@/features/links/actions/link.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LinkStatusBadge } from "@/components/shared/link-status-badge";
import { getShortUrl } from "@/lib/short-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { faviconUrl } from "@/lib/favicon";

type LinkRow = {
  id: string;
  title: string | null;
  shortCode: string;
  originalUrl: string;
  isActive: boolean;
  isPasswordProtected: boolean;
  isFavorite: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  tags: string[];
  customDomain: { domain: string } | null;
  campaign: { id: string; name: string } | null;
  _count: { clicks: number };
};

type StatusFilter = "all" | "active" | "inactive" | "expired" | "favorites";
type SortKey = "newest" | "oldest" | "clicks-desc" | "clicks-asc";

const PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "favorites", label: "Favorites" },
];

export function LinksTable({ links: initialLinks }: { links: LinkRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Toolbar state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  // Optimistic state
  const [optimisticActive, setOptimisticActive] = useState<
    Record<string, boolean>
  >({});
  const [optimisticFavorite, setOptimisticFavorite] = useState<
    Record<string, boolean>
  >({});

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filtered + sorted list (before pagination)
  const filtered = useMemo(() => {
    let list = initialLinks.map((l) => ({
      ...l,
      isActive: optimisticActive[l.id] ?? l.isActive,
      isFavorite: optimisticFavorite[l.id] ?? l.isFavorite,
    }));

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.shortCode.toLowerCase().includes(q) ||
          l.originalUrl.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    const now = new Date();
    if (statusFilter !== "all") {
      list = list.filter((l) => {
        const expired = l.expiresAt ? l.expiresAt < now : false;
        if (statusFilter === "favorites") return l.isFavorite;
        if (statusFilter === "expired") return expired;
        if (statusFilter === "active") return !expired && l.isActive;
        if (statusFilter === "inactive") return !expired && !l.isActive;
        return true;
      });
    }

    list = [...list].sort((a, b) => {
      if (sort === "newest")
        return b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "oldest")
        return a.createdAt.getTime() - b.createdAt.getTime();
      if (sort === "clicks-desc") return b._count.clicks - a._count.clicks;
      if (sort === "clicks-asc") return a._count.clicks - b._count.clicks;
      return 0;
    });

    return list;
  }, [
    initialLinks,
    optimisticActive,
    optimisticFavorite,
    search,
    statusFilter,
    sort,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const links = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  function handlePageChange(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function handlePerPageChange(val: string) {
    setPerPage(Number(val));
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleStatusChange(val: StatusFilter) {
    setStatusFilter(val);
    setPage(1);
  }

  // Selection helpers
  const allPageSelected =
    links.length > 0 && links.every((l) => selected.has(l.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        links.forEach((l) => next.delete(l.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        links.forEach((l) => next.add(l.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Row actions
  async function toggleActive(id: string, current: boolean) {
    setOptimisticActive((p) => ({ ...p, [id]: !current }));
    const result = await updateLinkAction(id, { isActive: !current });
    if (!result.success) {
      setOptimisticActive((p) => ({ ...p, [id]: current }));
      toast.error(result.message);
    }
  }

  async function toggleFavorite(id: string, current: boolean) {
    setOptimisticFavorite((p) => ({ ...p, [id]: !current }));
    const result = await toggleFavoriteLinkAction(id, !current);
    if (!result.success) {
      setOptimisticFavorite((p) => ({ ...p, [id]: current }));
      toast.error(result.message);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteLinkAction(id);
    if (!result.success) toast.error(result.message);
    else toast.success("Link deleted.");
  }

  async function handleDuplicate(id: string) {
    const result = await duplicateLinkAction(id);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Link duplicated.");
      startTransition(() => router.refresh());
    }
  }

  function copyShortUrl(
    shortCode: string,
    customDomain: { domain: string } | null,
  ) {
    navigator.clipboard.writeText(getShortUrl(shortCode, customDomain));
    toast.success("Short URL copied.");
  }

  // Bulk actions
  async function handleBulkDelete() {
    const ids = Array.from(selected);
    const result = await bulkDeleteLinksAction(ids);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      setSelected(new Set());
    }
  }

  async function handleBulkToggle(active: boolean) {
    const ids = Array.from(selected);
    const result = await bulkToggleActiveAction(ids, active);
    if (!result.success) toast.error(result.message);
    else {
      ids.forEach((id) => setOptimisticActive((p) => ({ ...p, [id]: active })));
      toast.success(result.message);
      setSelected(new Set());
    }
  }

  // Pagination page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      )
        pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, filtered.length);

  // Status tab counts (based on all links, ignoring search)
  const now = new Date();
  const statusCounts = useMemo(() => {
    const all = initialLinks.map((l) => ({
      ...l,
      isActive: optimisticActive[l.id] ?? l.isActive,
      isFavorite: optimisticFavorite[l.id] ?? l.isFavorite,
    }));
    const notExpired = (l: (typeof all)[number]) =>
      !l.expiresAt || l.expiresAt >= now;
    return {
      all: all.length,
      active: all.filter((l) => notExpired(l) && l.isActive).length,
      inactive: all.filter((l) => notExpired(l) && !l.isActive).length,
      expired: all.filter((l) => l.expiresAt && l.expiresAt < now).length,
      favorites: all.filter((l) => l.isFavorite).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLinks, optimisticActive, optimisticFavorite]);

  if (initialLinks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card">
        <EmptyState
          icon={Link2}
          title="No links yet"
          description="Create your first short link — every link comes with a QR code and click tracking."
          className="py-16"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Status pills ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === tab.value
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {tab.value === "favorites" && (
              <Star
                className={cn(
                  "h-3 w-3",
                  statusFilter === tab.value
                    ? "fill-primary-foreground"
                    : "fill-amber-400 text-amber-400",
                )}
              />
            )}
            {tab.label}
            <span
              className={cn(
                "rounded py-1 px-1.5 text-[10px] font-bold tabular-nums",
                statusFilter === tab.value
                  ? "bg-primary-foreground/15"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {statusCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Toolbar — single row ── */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-3">
        {/* Search */}
        <div className="relative mr-2 flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search links…"
            className="h-9 w-full rounded-lg pl-9 pr-8 text-sm focus-visible:ring-1 focus-visible:ring-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border shrink-0 mx-1" />

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-1 rounded-md border border-border/60 bg-transparent px-2.5 text-sm outline-none hover:bg-muted transition-colors">
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-medium text-foreground">
              {
                {
                  newest: "Newest",
                  oldest: "Oldest",
                  "clicks-desc": "Most clicks",
                  "clicks-asc": "Fewest clicks",
                }[sort]
              }
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="min-w-[140px]"
          >
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => setSort(v as SortKey)}
            >
              <DropdownMenuRadioItem value="newest">
                Newest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">
                Oldest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="clicks-desc">
                Most clicks
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="clicks-asc">
                Fewest clicks
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Per page */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-9 items-center gap-1 rounded-md border border-border/60 bg-transparent px-2.5 text-sm outline-none hover:bg-muted transition-colors">
            <span className="text-muted-foreground">Show:</span>
            <span className="font-medium text-foreground">{perPage}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="min-w-[120px]"
          >
            <DropdownMenuRadioGroup
              value={String(perPage)}
              onValueChange={handlePerPageChange}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <DropdownMenuRadioItem
                  key={n}
                  value={String(n)}
                  className="whitespace-nowrap"
                >
                  {n} / page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear — only when filters are non-default */}
        {(statusFilter !== "all" ||
          sort !== "newest" ||
          perPage !== 20 ||
          search) && (
          <>
            <div className="h-4 w-px bg-border shrink-0 mx-1" />
            <button
              onClick={() => {
                handleSearchChange("");
                handleStatusChange("all");
                setSort("newest");
                setPerPage(20);
                setPage(1);
              }}
              className="shrink-0 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* ── Bulk action bar ── */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          someSelected ? "max-h-16 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => handleBulkToggle(true)}
          >
            <ToggleRight className="mr-1.5 h-3.5 w-3.5" /> Activate
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => handleBulkToggle(false)}
          >
            <ToggleLeft className="mr-1.5 h-3.5 w-3.5" /> Deactivate
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete all
              </Button>
            }
            title={`Delete ${selected.size} link${selected.size !== 1 ? "s" : ""}?`}
            description="This cannot be undone. All selected short URLs will stop working immediately."
            confirmLabel="Delete all"
            onConfirm={handleBulkDelete}
          />
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {links.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No links match your filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer accent-primary-foreground"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Link
                </th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  <button
                    onClick={() =>
                      setSort(
                        sort === "clicks-desc" ? "clicks-asc" : "clicks-desc",
                      )
                    }
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide opacity-90 hover:opacity-100 transition-opacity"
                  >
                    Clicks
                    {sort === "clicks-desc" ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : sort === "clicks-asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-60" />
                    )}
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {links.map((link) => {
                const isActive = optimisticActive[link.id] ?? link.isActive;
                const isFavorite =
                  optimisticFavorite[link.id] ?? link.isFavorite;
                const shortUrl = getShortUrl(link.shortCode, link.customDomain);
                const isSelected = selected.has(link.id);
                const favicon = faviconUrl(link.originalUrl);

                return (
                  <tr
                    key={link.id}
                    className={cn(
                      "group transition-colors",
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(link.id)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                    </td>

                    {/* ── Link cell ── */}
                    <td className="px-4 py-3.5 min-w-0">
                      <div className="flex items-start gap-2.5">
                        {/* Favicon chip */}
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                          {favicon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={favicon} alt="" className="h-3.5 w-3.5" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          {/* Title + favorite */}
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/links/${link.id}`}
                              className="font-semibold text-foreground hover:underline truncate max-w-sm"
                            >
                              {link.title || link.shortCode}
                            </Link>
                            <button
                              onClick={() =>
                                toggleFavorite(link.id, isFavorite)
                              }
                              className={cn(
                                "shrink-0 transition-colors",
                                isFavorite
                                  ? "text-amber-400 hover:text-amber-500"
                                  : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-amber-400",
                              )}
                              title={
                                isFavorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              <Star
                                className={cn(
                                  "h-3.5 w-3.5",
                                  isFavorite && "fill-amber-400",
                                )}
                              />
                            </button>
                          </div>

                          {/* Short URL */}
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-xs font-medium text-primary hover:underline max-w-[200px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {shortUrl.replace(/^https?:\/\//, "")}
                            </a>
                            <button
                              onClick={() =>
                                copyShortUrl(link.shortCode, link.customDomain)
                              }
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy short URL"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            {link.customDomain && (
                              <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                                <Globe className="h-2.5 w-2.5" /> custom
                              </span>
                            )}
                          </div>

                          {/* Destination */}
                          <div className="mt-0.5 flex items-start gap-1">
                            <span className="mt-px shrink-0 text-xs text-muted-foreground">
                              ↳
                            </span>
                            <p className="truncate text-xs text-muted-foreground max-w-sm">
                              {link.originalUrl}
                            </p>
                          </div>

                          {/* Meta row */}
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            {link.campaign && (
                              <Link
                                href={`/dashboard/campaigns/${link.campaign.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                              >
                                <FolderKanban className="h-3 w-3" />{" "}
                                {link.campaign.name}
                              </Link>
                            )}
                            {link.isPasswordProtected && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" /> Password
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {link.createdAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {link.tags.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Tag className="h-3 w-3" />
                                {link.tags.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="hidden px-4 py-3 text-sm text-foreground sm:table-cell whitespace-nowrap align-top">
                      {link._count.clicks.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="hidden px-4 py-3 md:table-cell align-top">
                      <LinkStatusBadge isActive={isActive} expiresAt={link.expiresAt} />
                    </td>

                    {/* ── Action icons ── */}
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center justify-end gap-0.5">
                        {/* Edit */}
                        <Link
                          href={`/dashboard/links/${link.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <PenLine className="h-3.5 w-3.5" />
                        </Link>

                        {/* Statistics */}
                        <Link
                          href={`/dashboard/links/${link.id}`}
                          className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
                          title="Analytics"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </Link>

                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(link.id, isActive)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                            isActive
                              ? "text-primary hover:bg-primary/10"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          title={isActive ? "Deactivate" : "Activate"}
                        >
                          {isActive ? (
                            <ToggleRight className="h-3.5 w-3.5" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* More menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="More"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(link.id)}
                            >
                              <CopyPlus className="h-3.5 w-3.5" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmDialog
                              trigger={
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              }
                              title="Delete link?"
                              description="This cannot be undone. The short URL will stop working immediately."
                              confirmLabel="Delete"
                              onConfirm={() => handleDelete(link.id)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>
            {" of "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>
            {" links"}
            {filtered.length !== initialLinks.length && (
              <span className="ml-1 text-muted-foreground/70">
                · filtered from {initialLinks.length}
              </span>
            )}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Mobile */}
              <span className="flex h-8 items-center px-3 text-xs font-medium text-muted-foreground sm:hidden">
                {safePage} / {totalPages}
              </span>

              {/* Desktop */}
              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="hidden h-8 w-6 items-center justify-center text-xs text-muted-foreground sm:flex"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={cn(
                      "hidden h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all sm:flex",
                      safePage === p
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
