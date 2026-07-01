import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  lockedTitle: string;
  lockedDescription: string;
  requiredPlanLabel: string;
  upgradeLabel?: string;
};

export function PlanGateCard({
  icon: Icon,
  title,
  description,
  lockedTitle,
  lockedDescription,
  requiredPlanLabel,
  upgradeLabel = "Upgrade",
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">{requiredPlanLabel}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{lockedTitle}</p>
          <p className="text-xs text-muted-foreground">{lockedDescription}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings/billing">{upgradeLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
