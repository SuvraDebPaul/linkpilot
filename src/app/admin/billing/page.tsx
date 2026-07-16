import Link from "next/link";
import { DollarSign, Users, Crown } from "lucide-react";
import { getBillingOverview, getPayingUsers } from "@/server/queries/admin-billing.queries";
import { StatCard } from "@/components/admin/stat-card";
import { UserSearchBox } from "@/components/admin/user-search-box";

function planLabel(u: {
  lifetimeAccess: boolean;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}) {
  if (u.lifetimeAccess) return "Lifetime";
  if ([process.env.STRIPE_PRO_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(u.stripePriceId ?? ""))
    return "Pro";
  if (
    [process.env.STRIPE_STARTER_PRICE_ID, process.env.STRIPE_STARTER_YEARLY_PRICE_ID].includes(
      u.stripePriceId ?? "",
    )
  )
    return "Starter";
  return "—";
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
      <h1 className="text-2xl font-semibold text-zinc-100">Billing & Revenue</h1>
      <p className="mt-1 text-sm text-zinc-500">Manual overrides live on each user&apos;s own page.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Est. MRR" value={`$${overview.mrrEstimate.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Starter subscribers" value={overview.starterUsers} icon={Users} />
        <StatCard label="Pro subscribers" value={overview.proUsers} icon={Users} />
        <StatCard label="Lifetime purchases" value={overview.lifetimeCount} icon={Crown} />
      </div>

      <div className="mt-6 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Renews / expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {payingUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <p className="font-medium text-zinc-100">{u.name ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{planLabel(u)}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {u.stripeCurrentPeriodEnd ? u.stripeCurrentPeriodEnd.toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {payingUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
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
