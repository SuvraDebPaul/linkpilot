import type { ReactNode } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";
import { RouteTransition } from "@/components/shared/route-transition";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
      <AnnouncementBanner />
      <PublicHeader />
      <RouteTransition>{children}</RouteTransition>
      <PublicFooter />
    </div>
  );
}
