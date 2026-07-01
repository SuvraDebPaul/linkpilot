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
    <section className="border-b border-slate-200 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* Left: mock report card */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
              {/* Report header */}
              <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Campaign report
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      Summer Offer 2025
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
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
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                {[
                  { label: "Unique visitors", value: "1,923" },
                  { label: "QR scans", value: "641" },
                  { label: "Top country", value: "United States" },
                ].map((stat) => (
                  <div key={stat.label} className="px-5 py-4 text-center">
                    <p className="text-base font-bold text-slate-950">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Link performance */}
              <div className="px-6 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
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
                        <span className="font-medium text-slate-700">
                          {link.name}
                        </span>
                        <span className="font-semibold text-slate-950">
                          {link.clicks.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary/100"
                          style={{ width: `${link.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Shared via public link · No login required
                </p>
                <Link
                  href="/demo"
                  className="text-xs font-semibold text-primary hover:text-primary hover:underline"
                >
                  View live example →
                </Link>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Client reporting
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Share campaign reports clients actually understand
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Generate clean, shareable reports for every campaign. Send a link —
              your client sees the performance without needing a login or a PDF
              attachment.
            </p>

            <ul className="mt-8 space-y-3">
              {reportFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/register">Start your first campaign</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/demo">See live example report</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">Shareable reports on Starter and Pro plans</p>
          </div>
        </div>
      </div>
    </section>
  );
}
