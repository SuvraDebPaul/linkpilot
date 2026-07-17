import { getBlockedDomains } from "@/server/queries/admin-moderation.queries";
import { BlocklistPanel } from "@/components/admin/blocklist-panel";

export default async function AdminBlocklistPage() {
  const domains = await getBlockedDomains();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Domain Blocklist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        New links to these domains (or any subdomain of them) are rejected at creation time.
      </p>

      <div className="mt-4">
        <BlocklistPanel domains={domains} />
      </div>
    </div>
  );
}
