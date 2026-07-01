"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MousePointerClick } from "lucide-react";

type Click = {
  id: string;
  device: string;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  country: string | null;
  createdAt: Date;
};

const PAGE_SIZE = 8;

export function RecentClicksTable({ clicks }: { clicks: Click[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(clicks.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageClicks = clicks.slice(start, start + PAGE_SIZE);

  if (clicks.length === 0) {
    return (
      <EmptyState
        icon={MousePointerClick}
        title="No clicks yet"
        description="Share this link to start seeing click data here."
        className="py-10"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="pb-2 pr-3">Date</th>
              <th className="pb-2 pr-3">Device</th>
              <th className="hidden pb-2 pr-3 md:table-cell">Browser</th>
              <th className="hidden pb-2 pr-3 md:table-cell">OS</th>
              <th className="pb-2 pr-3">Country</th>
              <th className="pb-2">Referrer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageClicks.map((click) => (
              <tr key={click.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(click.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 pr-3 capitalize text-foreground text-xs">
                  {click.device.toLowerCase()}
                </td>
                <td className="hidden py-2 pr-3 text-xs text-foreground md:table-cell">
                  {click.browser ?? "—"}
                </td>
                <td className="hidden py-2 pr-3 text-xs text-foreground md:table-cell">
                  {click.os ?? "—"}
                </td>
                <td className="py-2 pr-3 text-xs text-foreground">{click.country ?? "—"}</td>
                <td className="max-w-[110px] truncate py-2 text-xs text-muted-foreground">
                  {click.referrer ?? "Direct"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, clicks.length)} of {clicks.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs font-medium text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
