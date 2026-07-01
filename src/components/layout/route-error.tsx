"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTEXT_MESSAGES: Record<string, { title: string; description: string }> = {
  links: {
    title: "Failed to load links",
    description: "We couldn't fetch your links. This might be a temporary issue.",
  },
  campaigns: {
    title: "Failed to load campaigns",
    description: "We couldn't fetch your campaigns. This might be a temporary issue.",
  },
  analytics: {
    title: "Failed to load analytics",
    description: "We couldn't load your analytics data. Try again or check back later.",
  },
  settings: {
    title: "Failed to load settings",
    description: "We couldn't load this settings page. Try refreshing.",
  },
  default: {
    title: "Something went wrong",
    description: "An unexpected error occurred. If this keeps happening, please contact support.",
  },
};

export function RouteError({
  error,
  reset,
  context = "default",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  context?: keyof typeof CONTEXT_MESSAGES;
}) {
  const { title, description } = CONTEXT_MESSAGES[context] ?? CONTEXT_MESSAGES.default;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/10 bg-destructive/10/60 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">ref: {error.digest}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={reset} className="gap-2">
        <RefreshCcw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}
