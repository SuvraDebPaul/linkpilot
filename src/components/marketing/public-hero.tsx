import Link from "next/link";
import { BarChart3, CheckCircle2, FileText, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-18%] h-[500px] w-[500px] rounded-full bg-primary/20/35 blur-3xl dark:opacity-40" />
        <div className="absolute right-[-10%] top-[5%] h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl dark:opacity-20" />
        <div className="absolute bottom-[-20%] left-[35%] h-[380px] w-[380px] rounded-full bg-emerald-100/45 blur-3xl dark:opacity-20" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-20">

        {/* Left — value proposition */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-slate-900/80">
            <span className="h-2 w-2 rounded-full bg-primary/100" />
            Campaign link management
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl xl:text-6xl dark:text-white">
            Your clients deserve{" "}
            <span className="text-primary">a real report,</span>{" "}
            not a screenshot.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Create a short link for every channel, group them into a campaign,
            and send one link — your client opens live results, no login needed.
            Stop guessing which channel drove the click.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Right — shortener form */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20/30 via-white/60 to-blue-200/40 blur-xl dark:via-slate-900/60 dark:opacity-50" />
          <div className="relative">
            <GuestLinkForm />
          </div>
        </div>

      </div>
    </section>
  );
}
