import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  linksUsed: number;
  linksLimit: number;
  campaignsUsed: number;
  campaignsLimit: number;
};

function pct(used: number, limit: number) {
  return Math.min(Math.round((used / limit) * 100), 100);
}

export function FreeUsageBanner({ linksUsed, linksLimit, campaignsUsed, campaignsLimit }: Props) {
  const linksPct = pct(linksUsed, linksLimit);
  const campaignsPct = pct(campaignsUsed, campaignsLimit);
  const maxPct = Math.max(linksPct, campaignsPct);

  if (maxPct < 50) return null;

  const isAtLimit = maxPct >= 100;
  const isUrgent = maxPct >= 80;

  const linksLeft = linksLimit - linksUsed;
  const campaignsLeft = campaignsLimit - campaignsUsed;

  let headline: string;
  let subtext: string;
  if (isAtLimit) {
    headline = "You've reached your free plan limit.";
    subtext = "Upgrade to Starter to keep creating links and campaigns.";
  } else if (isUrgent) {
    const parts = [];
    if (linksPct >= 80) parts.push(`${linksLeft} link${linksLeft !== 1 ? "s" : ""} left`);
    if (campaignsPct >= 80) parts.push(`${campaignsLeft} campaign${campaignsLeft !== 1 ? "s" : ""} left`);
    headline = `Running low — ${parts.join(" and ")}.`;
    subtext = "Starter gives you 500 links and 100 campaigns from $5/mo.";
  } else {
    headline = "You're halfway through your free plan.";
    subtext = "Starter gives you 500 links, 100 campaigns, and longer analytics when you're ready to grow.";
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4",
        isAtLimit
          ? "border-destructive/30 bg-destructive/5"
          : isUrgent
            ? "border-amber-200 bg-amber-50"
            : "border-primary/20 bg-primary/5",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Zap
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              isAtLimit
                ? "text-destructive"
                : isUrgent
                  ? "text-amber-500"
                  : "text-primary",
            )}
          />
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-semibold",
                isAtLimit
                  ? "text-destructive"
                  : isUrgent
                    ? "text-amber-900"
                    : "text-foreground",
              )}
            >
              {headline}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{subtext}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:w-44">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Links</span>
            <span className="font-medium">{linksUsed}/{linksLimit}</span>
          </div>
          <Progress
            value={linksPct}
            className={cn(
              "h-1.5",
              isAtLimit ? "[&_[data-slot=progress-indicator]]:bg-destructive" :
              isUrgent  ? "[&_[data-slot=progress-indicator]]:bg-amber-500" : "",
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Campaigns</span>
            <span className="font-medium">{campaignsUsed}/{campaignsLimit}</span>
          </div>
          <Progress
            value={campaignsPct}
            className={cn(
              "h-1.5",
              isAtLimit ? "[&_[data-slot=progress-indicator]]:bg-destructive" :
              isUrgent  ? "[&_[data-slot=progress-indicator]]:bg-amber-500" : "",
            )}
          />
        </div>

        <Button
          asChild
          size="sm"
          variant={isAtLimit ? "destructive" : "default"}
          className={cn(
            "shrink-0",
            isUrgent && !isAtLimit && "bg-amber-600 hover:bg-amber-700 text-white",
          )}
        >
          <Link href="/dashboard/settings/billing">
            Upgrade to Starter
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
