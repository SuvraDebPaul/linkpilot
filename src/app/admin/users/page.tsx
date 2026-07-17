import Link from "next/link";
import { ShieldAlert, Ban } from "lucide-react";
import { getUsersList } from "@/server/queries/admin-users.queries";
import { classifyPriceId } from "@/lib/subscription";
import { UserSearchBox } from "@/components/admin/user-search-box";

function planLabel(u: { lifetimeAccess: boolean; stripePriceId: string | null; stripeCurrentPeriodEnd: Date | null }) {
  if (u.lifetimeAccess) return "Lifetime";
  if (u.stripeCurrentPeriodEnd && u.stripeCurrentPeriodEnd > new Date()) {
    const tier = classifyPriceId(u.stripePriceId);
    if (tier) return tier[0].toUpperCase() + tier.slice(1);
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
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} total</p>

      <div className="mt-4 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Workspaces</th>
              <th className="px-4 py-3 font-medium">Links</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-accent">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{planLabel(u)}</td>
                <td className="px-4 py-3 text-foreground">{u._count.workspaces}</td>
                <td className="px-4 py-3 text-foreground">{u._count.links}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
