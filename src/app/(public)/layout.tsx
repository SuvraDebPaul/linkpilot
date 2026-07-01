import type { ReactNode } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 text-foreground antialiased">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
