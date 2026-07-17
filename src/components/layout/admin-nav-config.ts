import {
  LayoutDashboard,
  Users,
  Building2,
  ScrollText,
  CreditCard,
  Link2Off,
  ShieldBan,
  Clock,
  Webhook,
  ToggleLeft,
  Settings,
  BarChart3,
} from "lucide-react";

// Shared between AdminSidebar (desktop) and AdminMobileSidebar (drawer) so
// the two never drift out of sync.
export const adminMainNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export const adminModerationNav = [
  { href: "/admin/moderation/links", label: "Links", icon: Link2Off },
  { href: "/admin/moderation/blocklist", label: "Blocklist", icon: ShieldBan },
];

export const adminSystemNav = [
  { href: "/admin/system/cron-jobs", label: "Cron Jobs", icon: Clock },
  { href: "/admin/system/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/admin/system/flags", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/config", label: "Site Settings", icon: Settings },
];

export const adminComplianceNav = [{ href: "/admin/audit-log", label: "Audit Log", icon: ScrollText }];
