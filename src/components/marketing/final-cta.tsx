import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-muted/30 px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-950 via-slate-900 to-primary/90 px-8 py-16 text-center sm:px-12 lg:px-20">
          {/* Decorative flight paths */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -20 60 C 200 20, 300 180, 500 100 S 750 40, 820 90"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <path
              d="M -20 240 C 220 280, 320 120, 520 220 S 760 260, 820 210"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          </svg>

          <div className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[10px] tracking-widest text-primary-foreground/80 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            FINAL BOARDING CALL
          </div>

          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop sending screenshots.
            <br className="hidden sm:block" /> Start sending real reports.
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Your free account includes{" "}
            <strong className="text-white">50 managed links</strong>,{" "}
            <strong className="text-white">2 campaigns</strong>, and{" "}
            <strong className="text-white">basic analytics</strong> — everything
            you need to send your first client a report that makes you look like
            a pro.
          </p>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
            >
              <Link href="/register">Get started free</Link>
            </Button>
          </div>

          <p className="relative mt-5 text-sm text-slate-500">
            No credit card required · Cancel anytime ·{" "}
            <Link
              href="/pricing"
              className="underline hover:text-slate-300 transition-colors"
            >
              See all plans
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
