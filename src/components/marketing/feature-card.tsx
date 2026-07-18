import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card className="group border-border bg-card/90 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl hover:shadow-black/5">
      <CardContent className="p-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
