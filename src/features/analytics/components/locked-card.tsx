import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LockedCardProps = {
  title: string;
  requiredPlan: "Starter" | "Pro";
};

export function LockedCard({ title, requiredPlan }: LockedCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Blurred placeholder rows */}
        <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
          {[70, 45, 90, 30, 55].map((w, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className={`h-3 w-${w === 70 ? "[70%]" : w === 45 ? "[45%]" : w === 90 ? "[90%]" : w === 30 ? "[30%]" : "[55%]"} rounded bg-muted`} />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-[2px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{requiredPlan} plan</p>
          <p className="mt-1 text-xs text-muted-foreground">Upgrade to unlock {title.toLowerCase()}</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/dashboard/settings/billing">Upgrade</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
