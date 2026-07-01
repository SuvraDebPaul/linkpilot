import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  sub?: string;
  href?: string;
  variant?: "default" | "warning" | "success";
};

export function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  href,
  variant = "default",
}: StatCardProps) {
  const iconColor =
    variant === "warning"
      ? "text-amber-500"
      : variant === "success"
        ? "text-primary"
        : "text-muted-foreground";

  const cardClass =
    variant === "warning"
      ? "border-amber-200 bg-amber-50/40"
      : undefined;

  const content = (
    <Card className={cardClass}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
