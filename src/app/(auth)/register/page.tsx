import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Create a free LinkPilot account. Includes 50 managed links, 2 campaigns, and basic analytics — no credit card needed.",
};

const freePerks = [
  "50 managed links",
  "2 campaigns with analytics",
  "QR code for every link",
];

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border bg-card px-8 py-10 shadow-sm">
      <div className="mb-8 text-center">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-primary">
          NEW PASSENGER · BOOKING
        </p>
        <h1 className="text-2xl font-bold text-foreground">
          Start your free account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Includes a real taste of Starter — no card needed.
        </p>

        {/* Free plan perks */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {freePerks.map((perk) => (
            <span
              key={perk}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-2.5 w-2.5" />
              </span>
              {perk}
            </span>
          ))}
        </div>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
