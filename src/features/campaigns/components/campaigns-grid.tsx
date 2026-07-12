"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Folder, Link2, ArrowRight, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CreateCampaignDialog } from "@/features/campaigns/components/create-campaign-dialog";

const ACCENTS = [
  { icon: "text-teal-600", chip: "bg-teal-500/10", ring: "group-hover:border-teal-500/40" },
  { icon: "text-violet-600", chip: "bg-violet-500/10", ring: "group-hover:border-violet-500/40" },
  { icon: "text-amber-600", chip: "bg-amber-500/10", ring: "group-hover:border-amber-500/40" },
  { icon: "text-sky-600", chip: "bg-sky-500/10", ring: "group-hover:border-sky-500/40" },
  { icon: "text-rose-600", chip: "bg-rose-500/10", ring: "group-hover:border-rose-500/40" },
  { icon: "text-emerald-600", chip: "bg-emerald-500/10", ring: "group-hover:border-emerald-500/40" },
] as const;

type CampaignRow = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count: { links: number };
};

export function CampaignsGrid({
  campaigns,
  atLimit,
}: {
  campaigns: CampaignRow[];
  atLimit: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.3) }}
          >
            <Link href={`/dashboard/campaigns/${c.id}`} className="group block">
              <Card
                className={`h-full overflow-hidden border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md ${accent.ring}`}
              >
                <CardContent className="flex h-full flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}>
                        <Folder className={`h-5 w-5 ${accent.icon}`} />
                      </div>
                      <ArrowRight className="mt-1.5 h-4 w-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                    </div>
                    <p className="mt-3 truncate font-semibold text-foreground">{c.name}</p>
                    {c.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm italic text-muted-foreground/50">No description</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5" />
                      {c._count.links} link{c._count.links !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}

      {!atLimit && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(campaigns.length * 0.04, 0.3) }}
        >
          <CreateCampaignDialog
            trigger={
              <button className="group flex h-full min-h-[164px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent p-5 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                <Sparkles className="h-6 w-6" />
                <span className="text-sm font-medium">New campaign</span>
              </button>
            }
          />
        </motion.div>
      )}
    </div>
  );
}
