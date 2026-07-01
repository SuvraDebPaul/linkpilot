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
      <div className="hidden flex-col justify-between border-r border-border bg-card px-12 py-12 lg:flex xl:px-16">
        <Logo />

        <div>
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
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm leading-6 text-foreground">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Hit your free limits? Upgrade to{" "}
              <span className="font-semibold text-foreground">Starter at $5/mo</span>{" "}
              for 500 links and 100 campaigns, or{" "}
              <span className="font-semibold text-foreground">Pro at $10/mo</span>{" "}
              for unlimited everything and client-ready reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
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
