import Link from "next/link";
import { getSignupsPerDay, getTopWorkspacesByUsage } from "@/server/queries/admin-analytics.queries";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";

export default async function AdminAnalyticsPage() {
  const [signups, topWorkspaces] = await Promise.all([
    getSignupsPerDay(30),
    getTopWorkspacesByUsage(10),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform-wide growth and usage.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">New signups (last 30 days)</h2>
        <div className="mt-4">
          <ClicksLineChart data={signups} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Members</th>
              <th className="px-4 py-3 font-medium">Links</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {topWorkspaces.map((w) => (
              <tr key={w.id} className="hover:bg-accent">
                <td className="px-4 py-3">
                  <Link href={`/admin/workspaces/${w.id}`} className="block">
                    <p className="font-medium text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.slug}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{w.members}</td>
                <td className="px-4 py-3 text-foreground">{w.links}</td>
                <td className="px-4 py-3 text-foreground">{w.clicks}</td>
              </tr>
            ))}
            {topWorkspaces.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No workspaces yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
