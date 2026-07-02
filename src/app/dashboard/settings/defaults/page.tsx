import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { ensureWorkspace, getWorkspaceDefaults } from "@/server/queries/workspace.queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DefaultSettingsForm } from "@/features/workspace/components/default-settings-form";

export const metadata: Metadata = { title: "Default Settings" };

export default async function DefaultSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const workspaceId = await ensureWorkspace(session.user.id);
  const defaults = await getWorkspaceDefaults(workspaceId);
  if (!defaults) redirect("/dashboard");

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Default Settings"
        description="Applied automatically whenever you create a new link, unless overridden per link."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link defaults</CardTitle>
          <CardDescription>Slug style, redirect behavior, and cloaking for new links.</CardDescription>
        </CardHeader>
        <CardContent>
          <DefaultSettingsForm
            workspaceId={workspaceId}
            initialSlugStyle={defaults.slugStyle}
            initialRedirectType={defaults.defaultRedirectType}
            initialCloaking={defaults.defaultCloakingEnabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
