"use client";

import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, LayoutDashboard, Sun, Moon, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/shared/theme-provider";
import { getInitials } from "@/lib/initials";
import { AdminGlobalSearch } from "@/components/layout/admin-global-search";

const THEME_CYCLE = ["light", "dark", "auto"] as const;
const THEME_ICON = { light: Sun, dark: Moon, auto: MonitorSmartphone } as const;

export function AdminTopbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const ThemeIcon = THEME_ICON[theme];

  const initials = getInitials(session?.user?.name, session?.user?.email);
  const displayName = session?.user?.name ?? session?.user?.email ?? "Account";

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      <AdminGlobalSearch />

      {/* Spacer on mobile, where the search is hidden */}
      <div className="flex-1 sm:hidden" />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
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

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* User dropdown — rightmost */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
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
                <p className="mt-0.5 max-w-[140px] truncate text-[10px] leading-none text-muted-foreground">
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
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to Dashboard
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
