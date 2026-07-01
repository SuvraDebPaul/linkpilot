"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, X, Filter, Calendar,
  Clock, Monitor, Globe, Cpu, MapPin, Link2, MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Click = {
  id: string;
  device: string;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  country: string | null;
  createdAt: Date;
};

const PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

function deviceLabel(device: string) {
  return device.charAt(0).toUpperCase() + device.slice(1).toLowerCase();
}

// Flag emoji from a 2-letter ISO country code (e.g. "US" → 🇺🇸).
function flagFromCode(code: string): string {
  if (code.length !== 2) return "🌍";
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function referrerLabel(raw: string | null): string {
  if (!raw || raw === "Direct" || raw === "(direct)") return "Direct";
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

const COLUMNS = [
  { key: "time",     label: "Time",     icon: Clock },
  { key: "device",   label: "Device",   icon: Monitor },
  { key: "browser",  label: "Browser",  icon: Globe },
  { key: "os",       label: "OS",       icon: Cpu },
  { key: "country",  label: "Country",  icon: MapPin },
  { key: "referrer", label: "Referrer", icon: Link2 },
];

type FilterKey = "device" | "browser" | "os" | "country" | "referrer";

function uniqueSorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort();
}

export function RecentClicksTable({ clicks }: { clicks: Click[] }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    device: "all", browser: "all", os: "all", country: "all", referrer: "all",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const options = useMemo(() => ({
    device:   uniqueSorted(clicks.map((c) => c.device)),
    browser:  uniqueSorted(clicks.map((c) => c.browser)),
    os:       uniqueSorted(clicks.map((c) => c.os)),
    country:  uniqueSorted(clicks.map((c) => c.country)),
    referrer: uniqueSorted(clicks.map((c) => referrerLabel(c.referrer))),
  }), [clicks]);

  const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const toTime   = dateTo   ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  const filtered = useMemo(() => clicks.filter((c) => {
    const t = new Date(c.createdAt).getTime();
    return (
      (filters.device === "all"   || c.device === filters.device) &&
      (filters.browser === "all"  || c.browser === filters.browser) &&
      (filters.os === "all"       || c.os === filters.os) &&
      (filters.country === "all"  || c.country === filters.country) &&
      (filters.referrer === "all" || referrerLabel(c.referrer) === filters.referrer) &&
      (fromTime === null || t >= fromTime) &&
      (toTime === null   || t <= toTime)
    );
  }), [clicks, filters, fromTime, toTime]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const pageClicks = filtered.slice(start, start + perPage);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "all") || !!dateFrom || !!dateTo;

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({ device: "all", browser: "all", os: "all", country: "all", referrer: "all" });
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function handlePerPageChange(val: string) {
    setPerPage(Number(val));
    setPage(1);
  }

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
      {/* Filter block */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
        <span className="mr-1 flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filters:
        </span>

        <DateFilterButton
          label="Start date"
          value={dateFrom}
          max={dateTo}
          onChange={(v) => { setDateFrom(v); setPage(1); }}
        />
        <DateFilterButton
          label="End date"
          value={dateTo}
          min={dateFrom}
          onChange={(v) => { setDateTo(v); setPage(1); }}
        />

        <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />

        <FilterDropdown label="Device" value={filters.device} options={options.device} format={deviceLabel} onChange={(v) => setFilter("device", v)} />
        <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
        <FilterDropdown label="Browser" value={filters.browser} options={options.browser} onChange={(v) => setFilter("browser", v)} />
        <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
        <FilterDropdown label="OS" value={filters.os} options={options.os} onChange={(v) => setFilter("os", v)} />
        <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
        <FilterDropdown label="Country" value={filters.country} options={options.country} onChange={(v) => setFilter("country", v)} />
        <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
        <FilterDropdown label="Referrer" value={filters.referrer} options={options.referrer} onChange={(v) => setFilter("referrer", v)} />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-1 flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-primary text-primary-foreground">
            <tr className="divide-x divide-primary-foreground/15">
              {COLUMNS.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <col.icon className="h-3.5 w-3.5 opacity-80" />
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pageClicks.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No clicks match the selected filters.
                </td>
              </tr>
            ) : (
              pageClicks.map((click, i) => (
                <tr
                  key={click.id}
                  className={cn(
                    "divide-x divide-border/40 transition-colors hover:bg-muted/50",
                    i % 2 === 1 && "bg-muted/20",
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(click.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{deviceLabel(click.device)}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{click.browser ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{click.os ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-foreground">
                    {click.country ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-sm leading-none">{flagFromCode(click.country)}</span>
                        {click.country}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-2.5 text-xs text-foreground">
                    {referrerLabel(click.referrer)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + per-page selector */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + perPage, filtered.length)} of {filtered.length}
          {filtered.length !== clicks.length && (
            <span className="ml-1 text-muted-foreground/70">· filtered from {clicks.length}</span>
          )}
        </span>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-md border border-border/60 bg-transparent px-2.5 text-xs outline-none hover:bg-muted transition-colors">
              <span className="text-muted-foreground">Show:</span>
              <span className="font-medium text-foreground">{perPage}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="min-w-[110px]">
              <DropdownMenuRadioGroup value={String(perPage)} onValueChange={handlePerPageChange}>
                {PER_PAGE_OPTIONS.map((n) => (
                  <DropdownMenuRadioItem key={n} value={String(n)} className="whitespace-nowrap">
                    {n} / page
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs font-medium text-foreground">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  format,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  format?: (v: string) => string;
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-border/60 bg-transparent px-2.5 text-xs outline-none hover:bg-muted transition-colors">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium text-foreground">{value === "all" ? "All" : (format ? format(value) : value)}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="min-w-[140px]">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt} value={opt} className="whitespace-nowrap">
              {format ? format(opt) : opt}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatDateValue(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DateFilterButton({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
    }
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      className="relative flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border/60 px-2.5 text-xs outline-none hover:bg-muted transition-colors"
    >
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value ? formatDateValue(value) : "Any"}</span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      />
    </button>
  );
}
