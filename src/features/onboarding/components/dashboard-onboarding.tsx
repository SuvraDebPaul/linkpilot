import Link from "next/link";
import { CheckCircle2, Link2, Folder, BarChart3, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreateLinkDialog } from "@/features/links/components/create-link-dialog";
import { PLAN_LIMITS, type PlanTier } from "@/lib/subscription";

type Step = {
  icon: React.ElementType;
  title: string;
  description: string;
  done: boolean;
  cta: React.ReactNode;
};

type Props = {
  firstName: string | null;
  totalLinks: number;
  totalCampaigns: number;
  totalClicks: number;
  plan: PlanTier;
  isSuperAdmin: boolean;
};

function planWelcomeCopy(plan: PlanTier, isSuperAdmin: boolean) {
  if (isSuperAdmin) {
    return (
      <>
        Your <strong className="text-foreground">Pro</strong> account is ready for life —{" "}
        <strong className="text-foreground">unlimited links</strong>,{" "}
        <strong className="text-foreground">unlimited campaigns</strong>, and{" "}
        <strong className="text-foreground">full analytics</strong> included.
      </>
    );
  }

  const limits = PLAN_LIMITS[plan];
  const links = isFinite(limits.links) ? `${limits.links} links` : "unlimited links";
  const campaigns = isFinite(limits.campaigns) ? `${limits.campaigns} campaigns` : "unlimited campaigns";
  const analytics = plan === "free" ? "basic analytics" : "full analytics";
  const planName = plan === "free" ? "free" : plan[0].toUpperCase() + plan.slice(1);

  return (
    <>
      Your {planName} account is ready —{" "}
      <strong className="text-foreground">{links}</strong>,{" "}
      <strong className="text-foreground">{campaigns}</strong>, and{" "}
      <strong className="text-foreground">{analytics}</strong> included.
    </>
  );
}

export function DashboardOnboarding({
  firstName,
  totalLinks,
  totalCampaigns,
  totalClicks,
  plan,
  isSuperAdmin,
}: Props) {
  const steps: Step[] = [
    {
      icon: Link2,
      title: "Create your first link",
      description:
        "Shorten any URL, set a custom slug, add optional password protection and a QR code.",
      done: totalLinks > 0,
      cta:
        totalLinks > 0 ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/links">
              View links <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          <CreateLinkDialog />
        ),
    },
    {
      icon: Folder,
      title: "Create a campaign",
      description:
        "Group related links into a campaign to track their combined performance in one place.",
      done: totalCampaigns > 0,
      cta: (
        <Button asChild size="sm" variant={totalCampaigns > 0 ? "outline" : "default"}>
          <Link href="/dashboard/campaigns">
            {totalCampaigns > 0 ? "View campaigns" : "Go to campaigns"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      ),
    },
    {
      icon: BarChart3,
      title: "Check your analytics",
      description: "See click counts, device breakdown, and more as your links get shared.",
      done: totalClicks > 0,
      cta: (
        <Button asChild size="sm" variant={totalClicks > 0 ? "outline" : "default"}>
          <Link href="/dashboard/analytics">
            View analytics <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      ),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome{firstName ? `, ${firstName}` : " to LinkPilot"}!
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {planWelcomeCopy(plan, isSuperAdmin)}
            </p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-3xl font-black text-primary">{completedCount}/3</p>
            <p className="text-xs text-muted-foreground">steps done</p>
          </div>
        </div>
        <div className="mt-5">
          <Progress value={(completedCount / 3) * 100} className="h-2" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card
              key={i}
              className={step.done ? "border-primary/20 bg-primary/5" : undefined}
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      step.done ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${step.done ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-border text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className={`font-semibold ${step.done ? "text-primary" : "text-foreground"}`}>
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
                </div>

                <div>{step.cta}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {completedCount === 3 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center text-sm text-foreground">
          You&apos;ve completed all three steps. Explore your{" "}
          <Link href="/dashboard/analytics" className="font-semibold text-primary underline">
            analytics
          </Link>{" "}
          or{" "}
          <Link href="/pricing" className="font-semibold text-primary underline">
            upgrade your plan
          </Link>{" "}
          for more links, campaigns, and reports.
        </div>
      )}
    </div>
  );
}
