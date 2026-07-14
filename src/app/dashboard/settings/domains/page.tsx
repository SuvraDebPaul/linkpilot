import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { canAddDomain, PLAN_LIMITS } from "@/lib/plans";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { LockedFeatureHero } from "@/components/shared/locked-feature-hero";
import { AddDomainForm } from "@/features/domains/components/add-domain-form";
import { DomainList } from "@/features/domains/components/domain-list";

export const metadata: Metadata = { title: "Custom Domains" };

const APP_DOMAIN = process.env.APP_DOMAIN ?? "linkpilot.app";

export default async function DomainsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [plan, domains] = await Promise.all([
    getUserPlan(session.user.id),
    prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isPaidPlan = plan === "starter" || plan === "pro";

  if (!isPaidPlan) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Custom Domains"
          description="Use your own domain for branded short links."
        />
        <LockedFeatureHero
          title="Custom domains are a Starter feature"
          description={`Point your own domain at LinkPilot so every short link is branded to you instead of showing ${APP_DOMAIN}.`}
          features={[
            "1 custom domain on Starter",
            "Unlimited domains on Pro",
            "Free automatic SSL",
            "Simple one-time CNAME setup",
          ]}
          ctaLabel="Upgrade to Starter"
        />
      </div>
    );
  }

  const domainLimit = PLAN_LIMITS[plan].customDomains;
  const canAdd = canAddDomain(plan, domains.length);

  return (
    <div className="max-w-full space-y-6">
      <PageHeader
        title="Custom Domains"
        description="Use your own domain for branded short links."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a domain</CardTitle>
            <CardDescription>
              {plan === "starter"
                ? `Starter includes 1 custom domain. ${canAdd ? "Add yours below." : "Upgrade to Pro for unlimited domains."}`
                : "Point a CNAME record at your app domain, then verify."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canAdd ? (
              <>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      1
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Add a CNAME record
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm font-mono">
                        <div className="min-w-0 truncate">
                          <span className="text-muted-foreground">CNAME </span>
                          <span className="text-foreground">
                            your-subdomain
                          </span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="text-primary">{APP_DOMAIN}</span>
                        </div>
                        <CopyButton
                          value={APP_DOMAIN}
                          size="icon"
                          label=""
                          copiedLabel=""
                          variant="ghost"
                          ariaLabel="Copy CNAME target"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Use a subdomain (e.g.{" "}
                        <span className="font-mono">links.yourbrand.com</span>)
                        — CNAME records can&apos;t be set on a root domain. DNS
                        changes can take up to 30 minutes to propagate before
                        verification succeeds.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      2
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-medium text-foreground">
                        Enter your domain and verify
                      </p>
                      <AddDomainForm />
                    </div>
                  </li>
                </ol>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ve used your{" "}
                {domainLimit === 1 ? "1 domain" : `${domainLimit} domains`}.{" "}
                <Link
                  href="/dashboard/settings/billing"
                  className="font-medium text-primary hover:underline"
                >
                  Upgrade to Pro
                </Link>{" "}
                for unlimited custom domains.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="h-4 w-4 text-primary" /> Your domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DomainList domains={domains} appDomain={APP_DOMAIN} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
