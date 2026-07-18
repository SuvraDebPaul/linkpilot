import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeVariant =
  | "active"
  | "inactive"
  | "expired"
  | "protected"
  | "guest"
  | "default";

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

const variantClassName: Record<StatusBadgeVariant, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-border bg-muted text-muted-foreground",
  expired: "border-destructive/20 bg-destructive/10 text-destructive",
  protected: "border-purple-200 bg-purple-50 text-purple-700",
  guest: "border-amber-200 bg-amber-50 text-amber-700",
  default: "border-border bg-card text-foreground",
};

export function StatusBadge({
  label,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(variantClassName[variant], className)}
    >
      {label}
    </Badge>
  );
}
