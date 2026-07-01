import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getUserPlan, getUserUsage } from "@/lib/subscription";
import { PageHeader } from "@/components/shared/page-header";
import { BillingPanel } from "@/features/billing/components/billing-panel";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [plan, usage] = await Promise.all([
    getUserPlan(session.user.id),
    getUserUsage(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Billing" description="Manage your plan and payment details." />
      <Suspense>
        <BillingPanel
          currentPlan={plan}
          isLifetime={usage.isLifetime}
          linksCreated={usage.linksCreated}
          campaignsCreated={usage.campaignsCreated}
        />
      </Suspense>
    </div>
  );
}
