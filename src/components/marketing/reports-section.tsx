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

export function ReportsSection() {
  return (
    <section className="border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* Left: mock report card */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5">
              {/* Report header */}
              <div className="border-b border-border bg-gradient-to-br from-muted/40 to-card px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Campaign report
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      Summer Offer 2025
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Jun 1 – Jun 30 · 6 links
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-center">
                    <p className="text-2xl font-black text-primary">2,847</p>
                    <p className="text-xs text-primary">total clicks</p>
                  </div>
                </div>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[
                  { label: "Unique visitors", value: "1,923" },
                  { label: "QR scans", value: "641" },
                  { label: "Top country", value: "United States" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4 text-center">
                    <p className="text-base font-bold text-foreground">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Link performance */}
              <div className="px-6 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Link performance
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Summer sale landing page", clicks: 1240, pct: 100 },
                    { name: "Product catalogue PDF", clicks: 832, pct: 67 },
                    { name: "Event registration form", clicks: 421, pct: 34 },
                  ].map((link) => (
                    <div key={link.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground/80">
                          {link.name}
                        </span>
                        <span className="font-semibold text-foreground">
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

              <div className="border-t border-border bg-muted/30 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Shared via public link · No login required
                </p>
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
              Generate clean, shareable reports for every campaign. Send a link —
              your client sees the performance without needing a login or a PDF
              attachment.
            </p>

            <ul className="mt-8 space-y-3">
              {reportFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-foreground/80">
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
            <p className="mt-3 text-xs text-muted-foreground">Shareable reports on Starter and Pro plans</p>
          </div>
        </div>
      </div>
    </section>
  );
}
