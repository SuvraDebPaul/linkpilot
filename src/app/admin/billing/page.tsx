import Link from "next/link";
import { DollarSign, Users, Crown } from "lucide-react";
import { getBillingOverview, getPayingUsers } from "@/server/queries/admin-billing.queries";
import { classifyPriceId } from "@/lib/subscription";
import { StatCard } from "@/components/admin/stat-card";
import { UserSearchBox } from "@/components/admin/user-search-box";

// getPayingUsers already filters to lifetimeAccess or a still-current
// subscription, so no expiry check is needed here — just label what's there.
function planLabel(u: { lifetimeAccess: boolean; stripePriceId: string | null }) {
  if (u.lifetimeAccess) return "Lifetime";
  const tier = classifyPriceId(u.stripePriceId);
  return tier ? tier[0].toUpperCase() + tier.slice(1) : "—";
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [overview, payingUsers] = await Promise.all([getBillingOverview(), getPayingUsers(q)]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Billing & Revenue</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manual overrides live on each user&apos;s own page.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Est. MRR" value={`$${overview.mrrEstimate.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Starter subscribers" value={overview.starterUsers} icon={Users} />
        <StatCard label="Pro subscribers" value={overview.proUsers} icon={Users} />
        <StatCard label="Lifetime purchases" value={overview.lifetimeCount} icon={Crown} />
      </div>

      <div className="mt-6 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Renews / expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {payingUsers.map((u) => (
              <tr key={u.id} className="hover:bg-accent">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{planLabel(u)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.stripeCurrentPeriodEnd ? u.stripeCurrentPeriodEnd.toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {payingUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No paying users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
