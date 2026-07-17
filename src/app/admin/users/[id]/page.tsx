import { notFound } from "next/navigation";
import { getUserDetail } from "@/server/queries/admin-users.queries";
import { getNotes } from "@/server/queries/admin-notes.queries";
import { classifyPriceId } from "@/lib/subscription";
import { UserActionsPanel } from "@/components/admin/user-actions-panel";
import { UserBillingPanel } from "@/components/admin/user-billing-panel";
import { NotesPanel } from "@/components/admin/notes-panel";
import { LoginActivityList } from "@/components/admin/login-activity-list";

function currentPlan(u: {
  lifetimeAccess: boolean;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}) {
  if (u.lifetimeAccess) return "lifetime";
  if (u.stripeCurrentPeriodEnd && u.stripeCurrentPeriodEnd > new Date()) {
    const tier = classifyPriceId(u.stripePriceId);
    if (tier) return tier;
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
          <h1 className="text-2xl font-semibold text-foreground">{user.name ?? "Unnamed user"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
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

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Joined</p>
          <p className="mt-1 text-foreground">{user.createdAt.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email verified</p>
          <p className="mt-1 text-foreground">{user.emailVerified ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Links created</p>
          <p className="mt-1 text-foreground">{user.totalLinksCreated}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Campaigns created</p>
          <p className="mt-1 text-foreground">{user.totalCampaignsCreated}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Workspaces</h2>
        {user.workspaces.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No workspace memberships.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {user.workspaces.map((m) => (
              <li key={m.workspace.id} className="flex items-center justify-between">
                <span className="text-foreground">{m.workspace.name}</span>
                <span className="text-xs text-muted-foreground">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Recent login activity</h2>
        <LoginActivityList userId={user.id} events={user.loginEvents} />
      </div>

      <NotesPanel targetType="User" targetId={user.id} notes={notes} />

      <UserBillingPanel
        userId={user.id}
        hasSubscription={Boolean(user.stripeSubscriptionId)}
        hasStripeCustomer={Boolean(user.stripeCustomerId)}
      />

      <UserActionsPanel
        userId={user.id}
        email={user.email}
        isSuperAdmin={user.isSuperAdmin}
        suspended={user.suspended}
        currentPlan={currentPlan(user)}
      />
    </div>
  );
}
