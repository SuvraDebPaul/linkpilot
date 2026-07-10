import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";

type Props = {
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
};

export function LockedFeatureHero({ title, description, features, ctaLabel }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>
        <ul className="mt-4 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/settings/billing"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
