import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
};

export function PremiumCard({ children, className }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-border/80 bg-card/90 shadow-xl shadow-border/60 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
