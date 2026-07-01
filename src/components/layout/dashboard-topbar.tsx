"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/links": "Links",
  "/dashboard/links/new": "New Link",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/clients": "Clients",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/workspace": "Workspace",
  "/dashboard/settings/domains": "Domains",
  "/dashboard/settings/billing": "Billing",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/dashboard\/links\/[^/]+\/qr-assets$/)) return "QR Assets";
  if (pathname.match(/\/dashboard\/links\/.+/)) return "Link Details";
  if (pathname.match(/\/dashboard\/campaigns\/.+/)) return "Campaign Details";
  return "Dashboard";
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const title = getPageTitle(pathname);
  const initials = getInitials(session?.user?.name, session?.user?.email);
  const displayName = session?.user?.name ?? session?.user?.email ?? "Account";

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/links?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      {/* Page title */}
      <h1 className="hidden shrink-0 text-xl font-bold text-foreground lg:block">
        {title}
      </h1>

      {/* Search */}
      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          "relative hidden flex-1 transition-all duration-200 sm:flex",
          "max-w-md lg:mx-6",
        )}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search links…"
          className={cn(
            "h-9 w-full rounded-full border-border bg-muted/50 pl-9 text-sm transition-all duration-200 focus-visible:ring-1",
            searchFocused && "bg-background shadow-sm",
          )}
        />
      </form>

      {/* Spacer on mobile */}
      <div className="flex-1 lg:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        {/* Settings shortcut */}
        <Link
          href="/dashboard/settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Settings"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Link>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              {/* Name + email */}
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-none text-foreground">
                  {session?.user?.name ?? "Account"}
                </p>
                <p className="mt-0.5 max-w-[120px] truncate text-[10px] leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-2">
              <p className="text-xs font-semibold text-foreground">
                {session?.user?.name ?? "Account"}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CTA */}
        <Button asChild size="sm" className="hidden gap-1.5 sm:flex">
          <Link href="/dashboard/links/new">
            <Plus className="h-4 w-4" />
            New Link
          </Link>
        </Button>
      </div>
    </header>
  );
}
