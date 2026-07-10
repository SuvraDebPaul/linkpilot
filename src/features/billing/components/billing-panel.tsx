"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Infinity as InfinityIcon,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import type { PlanKey } from "@/lib/stripe";
import type { PlanTier } from "@/lib/plans";
import { FREE_LIMITS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type PlanFeature = { text: string; highlight?: boolean };

const PLAN_FEATURES: Record<string, PlanFeature[]> = {
  free: [
    { text: "Up to 50 managed links", highlight: true },
    { text: "Up to 2 campaigns", highlight: true },
    { text: "Basic click analytics" },
    { text: "QR code per link" },
    { text: "1 workspace" },
  ],
  starter: [
    { text: "Up to 500 managed links", highlight: true },
    { text: "Up to 100 campaigns", highlight: true },
    { text: "All analytics (devices, referrers, countries)", highlight: true },
    { text: "QR code per link" },
    { text: "Password-protected links" },
    { text: "Custom slugs" },
    { text: "1 custom branded domain" },
    { text: "White-label campaign reports" },
    { text: "3 client portals" },
    { text: "Scheduled report emails" },
    { text: "Max-click limits on links" },
  ],
  pro: [
    { text: "Unlimited links & campaigns", highlight: true },
    { text: "Advanced analytics", highlight: true },
    { text: "Team workspaces", highlight: true },
    { text: "Campaign reports + PDF" },
    { text: "Shareable public reports" },
    { text: "Unlimited branded domains" },
    { text: "Unlimited client portals" },
    { text: "Priority support" },
  ],
  lifetime: [
    { text: "Everything in Pro — forever" },
    { text: "No subscription, one-time payment" },
    { text: "All future Pro features included" },
    { text: "Branded domains" },
    { text: "Team workspaces" },
  ],
};

type BillingCycle = "monthly" | "yearly";

const PRICING = {
  starter: {
    monthly: { key: "starter_monthly" as PlanKey, price: 5, saving: null },
    yearly: { key: "starter_yearly" as PlanKey, price: 49, saving: "Save $11" },
  },
  pro: {
    monthly: { key: "pro_monthly" as PlanKey, price: 10, saving: null },
    yearly: { key: "pro_yearly" as PlanKey, price: 99, saving: "Save $21" },
  },
};

export function BillingPanel({
  currentPlan,
  isLifetime,
  linksCreated,
  campaignsCreated,
}: {
  currentPlan: PlanTier;
  isLifetime: boolean;
  linksCreated: number;
  campaignsCreated: number;
}) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(planKey: PlanKey) {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Failed to start checkout.");
    } catch {
      toast.error("Something went wrong.");
    }
    setLoadingPlan(null);
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Failed to open billing portal.");
    } catch {
      toast.error("Something went wrong.");
    }
    setPortalLoading(false);
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Payment successful — your plan has been upgraded!
        </div>
      )}
      {canceled && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          <XCircle className="h-4 w-4 shrink-0" />
          Checkout canceled — no charge was made.
        </div>
      )}

      {/* Current plan + usage */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-lg font-bold text-foreground">
                {isLifetime
                  ? "Pro (Lifetime)"
                  : currentPlan === "pro"
                    ? "Pro"
                    : currentPlan === "starter"
                      ? "Starter"
                      : "Free"}
              </p>
              {isLifetime && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                  <Star className="mr-1 h-3 w-3" />
                  Lifetime
                </Badge>
              )}
            </div>
          </div>
          {currentPlan !== "free" && !isLifetime && (
            <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
              {portalLoading ? "Opening…" : "Manage subscription"}
            </Button>
          )}
        </div>

        {currentPlan === "free" && (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <UsageMeter label="Links created" used={linksCreated} limit={FREE_LIMITS.links} />
            <UsageMeter
              label="Campaigns created"
              used={campaignsCreated}
              limit={FREE_LIMITS.campaigns}
            />
          </div>
        )}
      </div>

      {isLifetime && (
        <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <p className="flex items-center gap-1.5 font-semibold">
            <Star className="h-4 w-4 text-amber-500" />
            You have lifetime Pro access
          </p>
          <p className="text-amber-700 dark:text-amber-400/80">
            All Pro features are unlocked forever — no subscription needed.
          </p>
        </div>
      )}

      {!isLifetime && (
        <>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                cycle === "monthly"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                cycle === "yearly"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  cycle === "yearly"
                    ? "bg-background/20 text-background"
                    : "bg-primary/10 text-primary"
                }`}
              >
                -20%
              </span>
            </button>
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-3">
            {(["free", "starter", "pro"] as const).map((tier) => {
              const option = tier === "free" ? null : PRICING[tier][cycle];
              const isCurrentPlan = currentPlan === tier;
              const isFeatured = tier === "pro";

              return (
                <Card
                  key={tier}
                  className={`flex h-full flex-col ${
                    isFeatured
                      ? "border-primary/50 bg-gradient-to-b from-primary/[0.06] to-transparent shadow-lg shadow-primary/10 sm:scale-[1.03]"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">{tier}</CardTitle>
                      {isCurrentPlan && (
                        <Badge className="bg-primary/10 text-primary">Current</Badge>
                      )}
                      {isFeatured && !isCurrentPlan && (
                        <Badge className="bg-primary text-primary-foreground">Most popular</Badge>
                      )}
                    </div>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">
                        ${option ? option.price : 0}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {cycle === "monthly" ? "mo" : "yr"}
                      </span>
                      {option?.saving && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {option.saving}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <ul className="flex-1 space-y-2">
                      {PLAN_FEATURES[tier]?.map((f) => (
                        <li
                          key={f.text}
                          className={`flex items-start gap-2 text-sm ${
                            f.highlight ? "font-semibold text-foreground" : "text-foreground"
                          }`}
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              f.highlight ? "text-primary" : "text-primary/60"
                            }`}
                          />
                          {f.text}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-auto w-full"
                      variant={isFeatured ? "default" : "outline"}
                      disabled={isCurrentPlan || !!loadingPlan || !option}
                      onClick={() => option && handleUpgrade(option.key)}
                    >
                      {isCurrentPlan
                        ? "Current plan"
                        : !option
                          ? "Free plan"
                          : loadingPlan === option.key
                            ? "Redirecting…"
                            : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {currentPlan !== "pro" && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:border-amber-500/20 dark:from-amber-500/10 dark:via-card dark:to-orange-500/10">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <p className="font-bold text-foreground">Pro Lifetime Access</p>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">One-time</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay once, use forever. All Pro features, all future updates.
                  </p>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {PLAN_FEATURES.lifetime?.map((f) => (
                      <li key={f.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <InfinityIcon className="h-3 w-3 shrink-0 text-amber-500" />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <p className="text-3xl font-bold text-foreground">$199</p>
                  <Button
                    className="bg-amber-600 text-white hover:bg-amber-700"
                    disabled={!!loadingPlan}
                    onClick={() => handleUpgrade("lifetime")}
                  >
                    {loadingPlan === "lifetime" ? "Redirecting…" : "Get lifetime access"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const isAtLimit = used >= limit;
  const isWarning = pct > 70;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className={isAtLimit ? "font-semibold text-destructive" : ""}>
          {used} / {limit}
        </span>
      </div>
      <Progress
        value={pct}
        className={`h-1.5 ${
          isAtLimit
            ? "[&_[data-slot=progress-indicator]]:bg-destructive"
            : isWarning
              ? "[&_[data-slot=progress-indicator]]:bg-amber-400"
              : ""
        }`}
      />
    </div>
  );
}
