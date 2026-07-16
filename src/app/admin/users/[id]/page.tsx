import { notFound } from "next/navigation";
import { getUserDetail } from "@/server/queries/admin-users.queries";
import { getNotes } from "@/server/queries/admin-notes.queries";
import { UserActionsPanel } from "@/components/admin/user-actions-panel";
import { UserBillingPanel } from "@/components/admin/user-billing-panel";
import { NotesPanel } from "@/components/admin/notes-panel";

function currentPlan(u: {
  lifetimeAccess: boolean;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}) {
  if (u.lifetimeAccess) return "lifetime";
  if (u.stripePriceId && u.stripeCurrentPeriodEnd && u.stripeCurrentPeriodEnd > new Date()) {
    if ([process.env.STRIPE_PRO_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(u.stripePriceId))
      return "pro";
    if ([process.env.STRIPE_STARTER_PRICE_ID, process.env.STRIPE_STARTER_YEARLY_PRICE_ID].includes(u.stripePriceId))
      return "starter";
  }
  return "free";
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, notes] = await Promise.all([getUserDetail(id), getNotes("User", id)]);
  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{user.name ?? "Unnamed user"}</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        {user.isSuperAdmin && (
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
            Super Admin
          </span>
        )}
        {user.suspended && (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
            Suspended
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-zinc-500">Joined</p>
          <p className="mt-1 text-zinc-200">{user.createdAt.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Email verified</p>
          <p className="mt-1 text-zinc-200">{user.emailVerified ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Links created</p>
          <p className="mt-1 text-zinc-200">{user.totalLinksCreated}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Campaigns created</p>
          <p className="mt-1 text-zinc-200">{user.totalCampaignsCreated}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Workspaces</h2>
        {user.workspaces.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No workspace memberships.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {user.workspaces.map((m) => (
              <li key={m.workspace.id} className="flex items-center justify-between">
                <span className="text-zinc-200">{m.workspace.name}</span>
                <span className="text-xs text-zinc-500">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Recent login activity</h2>
        {user.loginEvents.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No login events recorded.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {user.loginEvents.map((e, i) => (
              <li key={i} className="flex items-center justify-between text-zinc-400">
                <span>
                  {e.type} · {e.browser} · {e.ip}
                </span>
                <span className="text-xs text-zinc-600">{e.createdAt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NotesPanel targetType="User" targetId={user.id} notes={notes} />

      <UserBillingPanel
        userId={user.id}
        hasSubscription={Boolean(user.stripeSubscriptionId)}
        hasStripeCustomer={Boolean(user.stripeCustomerId)}
      />

      <UserActionsPanel
        userId={user.id}
        isSuperAdmin={user.isSuperAdmin}
        suspended={user.suspended}
        currentPlan={currentPlan(user)}
      />
    </div>
  );
}
