import Link from "next/link";

import { Button } from "@/components/ui/button";
import styles from "./public-hero.module.css";

const gates = [
  {
    code: "IG",
    label: "Instagram bio",
    color: "bg-pink-500",
    top: "top-[12%]",
    path: "M 70 44 C 190 44, 210 150, 300 150",
  },
  {
    code: "QR",
    label: "Store flyer",
    color: "bg-amber-400",
    top: "top-[46%]",
    path: "M 70 150 C 190 150, 210 150, 300 150",
  },
  {
    code: "@",
    label: "Email blast",
    color: "bg-blue-500",
    top: "top-[80%]",
    path: "M 70 256 C 190 256, 210 150, 300 150",
  },
];

const flightLog = [
  {
    id: "LP-2841",
    channel: "Instagram bio",
    detail: "Chicago, US",
    hot: false,
  },
  {
    id: "LP-2842",
    channel: "Store flyer QR",
    detail: "scan recorded",
    hot: true,
  },
  {
    id: "LP-2843",
    channel: "Email blast",
    detail: "opened · London, UK",
    hot: false,
  },
  { id: "LP-2844", channel: "Google ad", detail: "Toronto, CA", hot: false },
  {
    id: "LP-2845",
    channel: "Store flyer QR",
    detail: "scan recorded",
    hot: true,
  },
  { id: "LP-2846", channel: "Instagram bio", detail: "Sydney, AU", hot: false },
];

export function PublicHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background/10">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <span className="flex items-center gap-2 font-mono text-[12px] tracking-widest text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          LINKPILOT CONTROL — LIVE
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-muted-foreground sm:block">
          GATE STATUS: ON TIME
        </span>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:py-16">
        {/* Left — copy */}
        <div>
          <h1
            className="text-4xl font-extrabold uppercase tracking-tight text-foreground sm:text-5xl xl:text-[3.4rem]"
            style={{ textWrap: "balance" }}
          >
            Every click files a<br />
            <span className="text-primary">flight plan.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Instagram, email, a printed QR — every channel is a gate. LinkPilot
            tracks each one from departure to destination, then hands your
            client the full manifest.
          </p>

          <div className="pt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className={`${styles.boardingBtn} h-12 gap-0 rounded-md bg-primary px-7 font-mono text-xs font-bold tracking-wider text-primary-foreground hover:bg-primary/90`}
            >
              <Link href="/register">BOARD FREE — NO CARD</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-md border-border bg-transparent px-7 font-mono text-xs tracking-wider text-foreground hover:bg-accent"
            >
              <Link href="/features">VIEW MANIFEST</Link>
            </Button>
          </div>

          <div className="pt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-wide text-muted-foreground">
            <span>50 LINKS FREE</span>
            <span className="text-border">·</span>
            <span>NO LOGIN FOR CLIENTS</span>
            <span className="text-border">·</span>
            <span>60 SEC SETUP</span>
          </div>
        </div>

        {/* Right — flight map */}
        <div className="relative h-80 overflow-hidden rounded-xl border border-border bg-muted/30">
          <svg
            viewBox="0 0 380 300"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {gates.map((gate, i) => (
              <path
                key={gate.code}
                id={`flight-path-${i}`}
                d={gate.path}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.5"
              />
            ))}
            {gates.map((gate, i) => (
              <circle
                key={gate.code}
                r="3"
                fill="#fbbf24"
                className={styles.flightDot}
              >
                <animateMotion
                  dur={`${2.6 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.5}s`}
                >
                  <mpath href={`#flight-path-${i}`} />
                </animateMotion>
              </circle>
            ))}
          </svg>

          {gates.map((gate) => (
            <div
              key={gate.code}
              className={`absolute left-4 ${gate.top} flex -translate-y-1/2 items-center gap-2 rounded-md border border-border bg-card/90 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-slate-950 ${gate.color}`}
              >
                {gate.code}
              </span>
              {gate.label}
            </div>
          ))}

          <div className="absolute right-4 top-1/2 min-w-32 -translate-y-1/2 rounded-lg border border-primary/30 bg-card px-4 py-3.5">
            <p className="font-mono text-[9px] tracking-widest text-muted-foreground">
              TOTAL ARRIVALS
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-primary">
              2,847
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              +18% this week
            </p>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden whitespace-nowrap border-t border-border py-3.5 bg-background">
        <div className={styles.ticker}>
          {[...flightLog, ...flightLog].map((entry, i) => (
            <span
              key={i}
              className="mx-5 font-mono text-[11px] text-muted-foreground"
            >
              {entry.id}{" "}
              <b
                className={`font-medium ${entry.hot ? "text-amber-500 dark:text-amber-400" : "text-foreground/80"}`}
              >
                {entry.channel}
              </b>{" "}
              → {entry.detail}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
