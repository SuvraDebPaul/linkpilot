"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ExternalLink,
  Lock,
  Star,
  BarChart2,
  MoreHorizontal,
  CopyPlus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MousePointerClick,
  Clock,
  CalendarPlus,
  Gauge,
} from "lucide-react";

import {
  deleteLinkAction,
  updateLinkAction,
  duplicateLinkAction,
  toggleFavoriteLinkAction,
} from "@/features/links/actions/link.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function faviconUrl(originalUrl: string): string | null {
  try {
    const host = new URL(originalUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

function domainLabel(originalUrl: string): string {
  try {
    return new URL(originalUrl).hostname.replace(/^www\./, "");
  } catch {
    return originalUrl;
  }
}

type Props = {
  id: string;
  title: string | null;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  isActive: boolean;
  isPasswordProtected: boolean;
  isFavorite: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  maxClicks: number | null;
  totalClicks: number;
  tags: string[];
};

export function LinkEditSidebar({
  id,
  title,
  shortCode,
  shortUrl,
  originalUrl,
  isActive,
  isPasswordProtected,
  isFavorite: initialFavorite,
  expiresAt,
  createdAt,
  maxClicks,
  totalClicks,
  tags,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [active, setActive] = useState(isActive);

  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const favicon = faviconUrl(originalUrl);
  const domain = domainLabel(originalUrl);

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    const result = await toggleFavoriteLinkAction(id, next);
    if (!result.success) {
      setIsFavorite(!next);
      toast.error(result.message);
    }
  }

  async function handleToggleActive() {
    const next = !active;
    setActive(next);
    const result = await updateLinkAction(id, { isActive: next });
    if (!result.success) {
      setActive(!next);
      toast.error(result.message);
    } else {
      toast.success(next ? "Link activated." : "Link deactivated.");
    }
  }

  async function handleDuplicate() {
    const result = await duplicateLinkAction(id);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Link duplicated.");
      startTransition(() => router.push(`/dashboard/links/${result.data?.id}`));
    }
  }

  async function handleDelete() {
    const result = await deleteLinkAction(id);
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Link deleted.");
      router.push("/dashboard/links");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-2">
        {/* Destination row */}
        <div className="flex items-center gap-2">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="h-4 w-4 rounded-sm" />
          ) : (
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="truncate text-xs font-medium text-muted-foreground" title={originalUrl}>
            {domain}
          </span>
        </div>

        {/* Title + status */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-foreground">
              {title || shortCode}
            </h1>
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "shrink-0 rounded-md p-1 transition-colors",
                isFavorite ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground hover:text-amber-400",
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-amber-400")} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isExpired ? (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">Expired</Badge>
            ) : active ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {isPasswordProtected && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <Lock className="mr-1 h-3 w-3" /> Password
              </Badge>
            )}
          </div>
        </div>

        {/* Short URL */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm font-semibold text-primary hover:underline"
          >
            {shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-primary">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <CopyButton value={shortUrl} size="icon" label="" copiedLabel="" variant="ghost" />
        </div>

        {/* Destination URL */}
        <p className="break-all text-xs leading-relaxed text-muted-foreground">
          <span className="text-muted-foreground/60">→ </span>
          {originalUrl}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[11px] font-normal text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-foreground">
                {maxClicks ? `${totalClicks.toLocaleString()}/${maxClicks.toLocaleString()}` : totalClicks.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">{maxClicks ? "Clicks / limit" : "Total clicks"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-foreground">
                {expiresAt
                  ? expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "Never"}
              </p>
              <p className="text-[11px] text-muted-foreground">Expires</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-foreground">
                {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-[11px] text-muted-foreground">Created</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none text-foreground">
                {isExpired ? "Expired" : active ? "Live" : "Paused"}
              </p>
              <p className="text-[11px] text-muted-foreground">Status</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/links/${id}`}>
              <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleToggleActive}>
            {active ? (
              <ToggleRight className="mr-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ToggleLeft className="mr-1.5 h-3.5 w-3.5" />
            )}
            {active ? "Deactivate" : "Activate"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <CopyPlus className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete link
                  </DropdownMenuItem>
                }
                title="Delete link?"
                description="This cannot be undone. The short URL will stop working immediately."
                confirmLabel="Delete"
                onConfirm={handleDelete}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
