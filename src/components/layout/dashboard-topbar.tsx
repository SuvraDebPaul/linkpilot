"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Plus,
  Sun,
  Moon,
  MonitorSmartphone,
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
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

const THEME_CYCLE = ["light", "dark", "auto"] as const;
const THEME_ICON = { light: Sun, dark: Moon, auto: MonitorSmartphone } as const;

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
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(session?.user?.name, session?.user?.email);
  const displayName = session?.user?.name ?? session?.user?.email ?? "Account";
  const ThemeIcon = THEME_ICON[theme];

  // Cmd/Ctrl+K focuses search from anywhere on the dashboard.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/links?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      {/* Search — takes the freed-up space, with a Cmd+K hint */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden flex-1 max-w-lg transition-all duration-200 sm:flex"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search links…"
          className={cn(
            "h-9 w-full rounded-full border-border bg-muted/50 pl-9 pr-14 text-sm transition-all duration-200 focus-visible:ring-1",
            searchFocused && "bg-background shadow-sm",
          )}
        />
        {!searchFocused && (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        )}
      </form>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        {/* Quick theme toggle — cycles light → dark → auto */}
        <button
          onClick={cycleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title={`Theme: ${theme} (click to change)`}
        >
          <ThemeIcon className="h-[18px] w-[18px]" />
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

        {/* CTA */}
        <Button asChild size="sm" className="hidden gap-1.5 sm:flex">
          <Link href="/dashboard/links/new">
            <Plus className="h-4 w-4" />
            New Link
          </Link>
        </Button>

        {/* User dropdown — rightmost */}
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
      </div>
    </header>
  );
}
