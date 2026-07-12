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
    <Card className="group border-slate-200/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:shadow-none">
      <CardContent className="p-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}
