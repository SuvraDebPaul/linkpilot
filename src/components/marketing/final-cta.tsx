import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-primary/90 px-8 py-16 text-center sm:px-12 lg:px-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop sending screenshots.<br className="hidden sm:block" /> Start sending real reports.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Your free account includes <strong className="text-white">50 managed links</strong>,{" "}
            <strong className="text-white">2 campaigns</strong>, and{" "}
            <strong className="text-white">basic analytics</strong> — everything you need to
            send your first client a report that makes you look like a pro.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-primary/100 px-8 text-base font-semibold text-white hover:bg-primary/60"
            >
              <Link href="/register">Get started free</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            No credit card required · Cancel anytime ·{" "}
            <Link href="/pricing" className="underline hover:text-slate-300 transition-colors">
              See all plans
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
