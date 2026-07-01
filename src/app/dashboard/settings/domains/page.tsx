import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserPlan } from "@/lib/subscription";
import { canAddDomain, PLAN_LIMITS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
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
  const domainLimit = PLAN_LIMITS[plan].customDomains;
  const canAdd = canAddDomain(plan, domains.length);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Custom Domains" description="Use your own domain for branded short links." />

      {!isPaidPlan && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-sm font-medium text-amber-800">Starter or Pro feature</p>
          <p className="mt-0.5 text-sm text-amber-700">
            Custom domains are available on Starter ($5/mo) and Pro plans.{" "}
            <a href="/dashboard/settings/billing" className="font-medium underline">Upgrade →</a>
          </p>
        </div>
      )}

      {isPaidPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a domain</CardTitle>
            <CardDescription>
              {plan === "starter"
                ? `Starter includes 1 custom domain. ${canAdd ? "Add yours below." : "Upgrade to Pro for unlimited domains."}`
                : "Point a CNAME record at "}
              {plan === "pro" && (
                <><code className="rounded bg-muted px-1 font-mono text-xs">{APP_DOMAIN}</code>, then click Verify.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canAdd ? (
              <>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-mono">
                  <span className="text-muted-foreground">CNAME </span>
                  <span className="text-foreground">your-subdomain</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="text-primary">{APP_DOMAIN}</span>
                </div>
                <AddDomainForm />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ve used your {domainLimit === 1 ? "1 domain" : `${domainLimit} domains`}.{" "}
                <a href="/dashboard/settings/billing" className="font-medium text-primary hover:underline">
                  Upgrade to Pro
                </a>{" "}
                for unlimited custom domains.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your domains</CardTitle>
        </CardHeader>
        <CardContent>
          <DomainList domains={domains} appDomain={APP_DOMAIN} />
        </CardContent>
      </Card>
    </div>
  );
}
