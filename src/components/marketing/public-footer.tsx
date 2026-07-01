import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const footerLinks = [
  {
    label: "Shortener",
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

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex justify-between max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start">
          <Logo />

          <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
            LinkPilot helps you create temporary short links with expiry,
            password protection, and QR codes. Campaign dashboard and analytics
            are coming next.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LinkPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
