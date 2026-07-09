import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  Mail,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";

const columns = [
  {
    title: "Product",
    icon: Link2,
    links: [
      { label: "Free shortener", href: "/" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Live demo", href: "/demo" },
    ],
  },
  {
    title: "Account",
    icon: LayoutDashboard,
    links: [
      { label: "Login", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Support",
    icon: LifeBuoy,
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Email us", href: "mailto:hello@linkpilot.app" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(20,184,166,0.10),transparent_32%),radial-gradient(circle_at_85%_100%,rgba(59,130,246,0.08),transparent_32%)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start">
            <Logo />

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Campaign link management for freelancers, small businesses, and
              agencies — short links, QR codes, analytics, and client-ready
              reports in one dashboard.
            </p>

            <Link
              href="mailto:hello@linkpilot.app"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              hello@linkpilot.app
            </Link>

            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Built for freelancers &amp; agencies
            </span>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <column.icon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-950">
                  {column.title}
                </h3>
              </div>

              <nav className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex w-fit items-center gap-1 text-sm text-slate-600 transition hover:text-primary"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LinkPilot. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">
            Short links that stay in your control.
          </p>
        </div>
      </div>
    </footer>
  );
}
