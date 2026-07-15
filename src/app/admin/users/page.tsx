import Link from "next/link";
import { ShieldAlert, Ban } from "lucide-react";
import { getUsersList } from "@/server/queries/admin-users.queries";
import { UserSearchBox } from "@/components/admin/user-search-box";

function planLabel(u: { lifetimeAccess: boolean; stripePriceId: string | null; stripeCurrentPeriodEnd: Date | null }) {
  if (u.lifetimeAccess) return "Lifetime";
  if (u.stripePriceId && u.stripeCurrentPeriodEnd && u.stripeCurrentPeriodEnd > new Date()) {
    if ([process.env.STRIPE_PRO_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(u.stripePriceId)) return "Pro";
    if ([process.env.STRIPE_STARTER_PRICE_ID, process.env.STRIPE_STARTER_YEARLY_PRICE_ID].includes(u.stripePriceId)) return "Starter";
  }
  return "Free";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { users, total, pageSize } = await getUsersList(q, page ? Number(page) : 1);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Users</h1>
      <p className="mt-1 text-sm text-zinc-500">{total} total</p>

      <div className="mt-4 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Workspaces</th>
              <th className="px-4 py-3 font-medium">Links</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <p className="font-medium text-zinc-100">{u.name ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{planLabel(u)}</td>
                <td className="px-4 py-3 text-zinc-300">{u._count.workspaces}</td>
                <td className="px-4 py-3 text-zinc-300">{u._count.links}</td>
                <td className="px-4 py-3 text-zinc-500">{u.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.isSuperAdmin && (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">
                        <ShieldAlert className="h-3 w-3" /> Admin
                      </span>
                    )}
                    {u.suspended && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                        <Ban className="h-3 w-3" /> Suspended
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
