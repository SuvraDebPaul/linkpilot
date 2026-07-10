import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureWorkspace, getWorkspaceDefaults } from "@/server/queries/workspace.queries";
import { getUserPlan } from "@/lib/subscription";
import { PageHeader } from "@/components/shared/page-header";
import { DefaultSettingsForm } from "@/features/workspace/components/default-settings-form";

export const metadata: Metadata = { title: "Default Settings" };

export default async function DefaultSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const workspaceId = await ensureWorkspace(session.user.id);
  const [defaults, plan] = await Promise.all([
    getWorkspaceDefaults(workspaceId),
    getUserPlan(session.user.id),
  ]);
  if (!defaults) redirect("/dashboard");

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Default Settings"
        description="Applied automatically whenever you create a new link, unless overridden per link."
      />

      <DefaultSettingsForm
        workspaceId={workspaceId}
        initialSlugStyle={defaults.slugStyle}
        initialRedirectType={defaults.defaultRedirectType}
        initialCloaking={defaults.defaultCloakingEnabled}
        initialQrFgColor={defaults.defaultQrFgColor}
        initialQrBgColor={defaults.defaultQrBgColor}
        initialQrEcLevel={defaults.defaultQrEcLevel}
        canEditQrDefaults={plan === "starter" || plan === "pro"}
      />
    </div>
  );
}
