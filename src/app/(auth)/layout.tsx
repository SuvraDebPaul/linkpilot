import { BarChart3, CheckCircle2, FolderOpen, Link2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";

const freeIncludes = [
  { icon: Link2, text: "50 managed links — permanent, never expire" },
  { icon: FolderOpen, text: "2 campaigns to organise and group your links" },
  { icon: BarChart3, text: "Basic analytics — clicks, devices, and QR scans" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[1fr_1fr]">

      {/* Left panel — visible on lg+ */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card px-12 py-12 lg:flex xl:px-16">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M -20 120 C 150 60, 250 280, 480 180" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 6" />
          <path d="M -20 620 C 180 700, 280 460, 480 600" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 6" />
        </svg>

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] tracking-widest text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            BOARDING PASS · FREE ACCOUNT
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Campaign link management
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">
            Short links, QR codes, campaigns, and analytics — in one place.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            LinkPilot is built for freelancers and small businesses who need to
            manage campaign links, track performance, and share results with
            clients. The free account gives you a real taste of the platform.
          </p>

          <ul className="mt-8 space-y-4">
            {freeIncludes.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm leading-6 text-foreground">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-dashed border-border pt-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Hit your free limits? Upgrade to{" "}
              <span className="font-semibold text-foreground">Starter at $5/mo</span>{" "}
              for 500 links and 100 campaigns, or{" "}
              <span className="font-semibold text-foreground">Pro at $10/mo</span>{" "}
              for unlimited everything and client-ready reports.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-3 w-3" />
          </span>
          <p className="text-sm text-muted-foreground">No credit card required to get started</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        {/* Logo shown only on mobile */}
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>

    </div>
  );
}
