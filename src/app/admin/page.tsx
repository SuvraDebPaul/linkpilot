import { Users, Building2, Link2, MousePointerClick, UserPlus, ShieldOff, Crown, DollarSign } from "lucide-react";
import { getPlatformStats } from "@/server/queries/admin.queries";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminDashboardPage() {
  const stats = await getPlatformStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Platform Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">A snapshot of LinkPilot right now.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Total Workspaces" value={stats.totalWorkspaces} icon={Building2} />
        <StatCard label="Total Links" value={stats.totalLinks} icon={Link2} />
        <StatCard label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} />
        <StatCard
          label="New Users (7d)"
          value={stats.newUsers7d}
          icon={UserPlus}
          hint={`${stats.newUsers30d} in the last 30 days`}
        />
        <StatCard
          label="Est. MRR"
          value={`$${stats.mrrEstimate.toLocaleString()}`}
          icon={DollarSign}
          hint={`${stats.starterSubscribers} starter · ${stats.proSubscribers} pro`}
        />
        <StatCard label="Lifetime Purchases" value={stats.lifetimeUsers} icon={Crown} />
        <StatCard
          label="Suspended"
          value={stats.suspendedUsers + stats.suspendedWorkspaces}
          icon={ShieldOff}
          hint={`${stats.suspendedUsers} users · ${stats.suspendedWorkspaces} workspaces`}
        />
      </div>
    </div>
  );
}
