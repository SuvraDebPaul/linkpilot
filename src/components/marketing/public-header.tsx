"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Sun, Moon, MonitorSmartphone } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

const APP_URL = "/dashboard";

const THEME_CYCLE = ["light", "dark", "auto"] as const;
const THEME_ICON = { light: Sun, dark: Moon, auto: MonitorSmartphone } as const;

const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { status } = useSession();
  const { theme, setTheme } = useTheme();
  const isLoggedIn = status === "authenticated";
  const ThemeIcon = THEME_ICON[theme];

  function isActivePath(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/60 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const active = isActivePath(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition hover:text-slate-950 dark:hover:text-white",
                  active
                    ? "border-b-2 border-b-primary bg-primary/10 px-3 py-2 text-primary"
                    : "px-3 py-2 text-slate-600 dark:text-slate-400",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label={`Theme: ${theme} (click to change)`}
            title={`Theme: ${theme} (click to change)`}
            className="text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ThemeIcon className="h-[18px] w-[18px]" />
          </Button>

          {isLoggedIn ? (
            <Button asChild className="gap-2">
              <Link href={APP_URL}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label={`Theme: ${theme} (click to change)`}
            title={`Theme: ${theme} (click to change)`}
            className="text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ThemeIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <nav aria-label="Mobile navigation" className="grid gap-2">
              {navItems.map((item) => {
                const active = isActivePath(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              {isLoggedIn ? (
                <Button asChild className="gap-2">
                  <Link href={APP_URL} onClick={() => setIsOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
