import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Globe,
  Link2,
  Monitor,
  MousePointerClick,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const reportFeatures = [
  { icon: MousePointerClick, label: "Total clicks & unique visitors" },
  { icon: Link2, label: "Top-performing links in the campaign" },
  { icon: Monitor, label: "Device breakdown (mobile, desktop, tablet)" },
  { icon: Globe, label: "Country and city data" },
  { icon: BarChart3, label: "Date-range performance charts" },
  { icon: Share2, label: "Shareable report link — no login to view" },
];

const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2];

export function ReportsSection() {
  return (
    <section className="border-b border-border bg-background/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* Left: itinerary ticket */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5">
              {/* Ticket header */}
              <div className="bg-linear-to-br from-muted/50 to-card px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      CAMPAIGN ITINERARY
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      Summer Offer 2025
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Jun 1 – Jun 30 · 6 links
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-center">
                    <p className="text-2xl font-black tabular-nums text-primary">
                      2,847
                    </p>
                    <p className="font-mono text-[10px] tracking-wide text-primary">
                      TOTAL CLICKS
                    </p>
                  </div>
                </div>
              </div>

              {/* Perforated tear line */}
              <div className="flex items-center gap-2 px-6">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border bg-muted/60" />
                <span className="h-px flex-1 border-t border-dashed border-border" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border bg-muted/60" />
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { label: "Unique visitors", value: "1,923" },
                  { label: "QR scans", value: "641" },
                  { label: "Top country", value: "United States" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4 text-center">
                    <p className="text-base font-bold tabular-nums text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
                      {stat.label.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Perforated tear line */}
              <div className="flex items-center gap-2 px-6">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border bg-muted/60" />
                <span className="h-px flex-1 border-t border-dashed border-border" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border bg-muted/60" />
              </div>

              {/* Link performance — flight legs */}
              <div className="px-6 py-5">
                <p className="mb-3 font-mono text-[10px] tracking-widest text-muted-foreground">
                  LINK PERFORMANCE
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: "Summer sale landing page",
                      clicks: 1240,
                      pct: 100,
                    },
                    { name: "Product catalogue PDF", clicks: 832, pct: 67 },
                    { name: "Event registration form", clicks: 421, pct: 34 },
                  ].map((link) => (
                    <div key={link.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground/80">
                          {link.name}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {link.clicks.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${link.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket stub footer */}
              <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Shared via public link · No login required
                </p>
                <div
                  className="flex h-4 items-end gap-[1.5px]"
                  aria-hidden="true"
                >
                  {barcodeWidths.map((w, i) => (
                    <span
                      key={i}
                      className="bg-muted-foreground/40"
                      style={{
                        width: `${w}px`,
                        height: i % 3 === 0 ? "100%" : "70%",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Client reporting
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Share campaign reports clients actually understand
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Generate clean, shareable reports for every campaign. Send a link
              — your client sees the performance without needing a login or a
              PDF attachment.
            </p>

            <ul className="mt-8 space-y-3">
              {reportFeatures.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 text-sm text-foreground/80"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/register">Start your first campaign</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Shareable reports on Starter and Pro plans
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
