import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BarChart3, CheckCircle2, FolderOpen, Link2 } from "lucide-react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your LinkPilot account to manage your links, campaigns, and analytics.",
};

const accountIncludes = [
  { icon: Link2, text: "Links & QR codes" },
  { icon: FolderOpen, text: "Campaign dashboard" },
  { icon: BarChart3, text: "Click analytics" },
];

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-background px-8 py-10 shadow-sm">
      <div className="mb-8 text-center">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-primary">
          PASSENGER SIGN-IN
        </p>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to access your links, campaigns, and analytics.
        </p>

        {/* What's inside chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {accountIncludes.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Icon className="h-3 w-3 text-primary" />
              {text}
            </span>
          ))}
        </div>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <div className="mt-6 space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one free
          </Link>
        </p>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-2.5 w-2.5" />
          </span>
          Free account includes 50 links, 2 campaigns, and basic analytics
        </p>
      </div>
    </div>
  );
}
