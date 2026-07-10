import type { PlanTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PlanBadge({ plan, className }: { plan: PlanTier; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-semibold capitalize",
        plan === "pro" && "bg-primary/10 text-primary",
        plan === "starter" && "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
        plan === "free" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {plan} plan
    </span>
  );
}
