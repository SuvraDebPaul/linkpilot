import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Globe, Megaphone } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import {
  getGeoTemplates,
  getCampaignTemplates,
} from "@/server/queries/templates.queries";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeoTemplatesPanel } from "@/features/templates/components/geo-templates-panel";
import { CampaignTemplatesPanel } from "@/features/templates/components/campaign-templates-panel";

export const metadata: Metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const workspaceId = await ensureWorkspace(session.user.id);
  const [geoTemplates, campaignTemplates] = await Promise.all([
    getGeoTemplates(workspaceId),
    getCampaignTemplates(workspaceId),
  ]);

  return (
    <div className="max-w-full space-y-6">
      <PageHeader
        title="Templates"
        description="Reusable geo-targeting rule sets and UTM campaign tags for building your links."
      />

      <Tabs defaultValue="geo">
        <TabsList className="h-10 p-1">
          <TabsTrigger value="geo" className="h-8 gap-1.5 px-4">
            <Globe className="h-3.5 w-3.5" /> Geo templates
          </TabsTrigger>
          <TabsTrigger value="campaign" className="h-8 gap-1.5 px-4">
            <Megaphone className="h-3.5 w-3.5" /> Campaign templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geo" className="mt-4">
          <GeoTemplatesPanel
            workspaceId={workspaceId}
            initialTemplates={geoTemplates}
          />
        </TabsContent>
        <TabsContent value="campaign" className="mt-4">
          <CampaignTemplatesPanel
            workspaceId={workspaceId}
            initialTemplates={campaignTemplates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
