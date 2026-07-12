"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
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
  Mail,
  Globe,
  Users,
  Gauge,
  UserPlus,
  Link2,
  CheckCheck,
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
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/server/queries/notifications.queries";

const THEME_CYCLE = ["light", "dark", "auto"] as const;
const THEME_ICON = { light: Sun, dark: Moon, auto: MonitorSmartphone } as const;

const ACTION_ICON = {
  mail: Mail,
  globe: Globe,
  users: Users,
  gauge: Gauge,
  "user-plus": UserPlus,
  link: Link2,
} as const;

export function DashboardTopbar({ actionItems = [] }: { actionItems?: ActionItem[] }) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {actionItems.length > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.35, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card"
                />
              )}
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {actionItems.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {actionItems.length}
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            {actionItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <CheckCheck className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground">No action items right now.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {actionItems.map((item) => {
                  const Icon = ACTION_ICON[item.icon];
                  return (
                    <DropdownMenuItem key={item.id} asChild className="cursor-pointer">
                      <Link href={item.href} className="items-start gap-2.5 py-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            item.severity === "warning"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick theme toggle — cycles light → dark → auto */}
        <motion.button
          onClick={cycleTheme}
          whileTap={{ scale: 0.88 }}
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title={`Theme: ${theme} (click to change)`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ThemeIcon className="h-[18px] w-[18px]" />
            </motion.span>
          </AnimatePresence>
        </motion.button>

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
              onClick={() => signOut({ callbackUrl: "/" })}
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
