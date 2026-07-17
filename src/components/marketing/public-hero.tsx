import Link from "next/link";
import { BarChart3, CheckCircle2, FileText, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoDashboardButton } from "@/components/shared/demo-dashboard-button";
import { GuestLinkForm } from "@/features/guest-links";

const highlights = [
  { icon: BarChart3, label: "See which channel wins" },
  { icon: QrCode, label: "Track QR + digital together" },
  { icon: FileText, label: "Share reports, not screenshots" },
];

const trustPoints = [
  "Clients open a live report — not a PDF",
  "50 links + 2 campaigns free",
  "No credit card required",
];

export function PublicHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-18%] h-125 w-125 rounded-full bg-primary/25 blur-3xl dark:opacity-40" />
        <div className="absolute right-[-10%] top-[5%] h-105 w-105 rounded-full bg-blue-200/30 blur-3xl dark:opacity-20" />
        <div className="absolute bottom-[-20%] left-[35%] h-95 w-95 rounded-full bg-emerald-100/45 blur-3xl dark:opacity-20" />
      </div>

      <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-8">
        {/* Left — value proposition */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Campaign link management
          </div>

          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            Your clients deserve{" "}
            <span className="text-primary">a real report,</span> not a
            screenshot.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Create a short link for every channel, group them into a campaign,
            and send one link — your client opens live results, no login needed.
            Stop guessing which channel drove the click.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/register">Get started free</Link>
            </Button>
            <DemoDashboardButton
              size="lg"
              className="h-12 px-8 text-base"
              label="View demo dashboard"
            />
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {trustPoints.map((point) => (
              <span
                key={point}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Right — shortener form */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-primary/25 via-card/60 to-blue-200/40 blur-xl dark:opacity-50" />
          <div className="relative">
            <GuestLinkForm />
          </div>
        </div>
      </div>
    </section>
  );
}
