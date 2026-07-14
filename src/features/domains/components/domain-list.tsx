"use client";

import React, { useTransition } from "react";
import { toast } from "@/lib/toast";
import { CheckCircle2, XCircle, Clock, Trash2, RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { verifyDomainAction, removeDomainAction } from "@/features/domains/actions/domain.actions";
import type { DomainStatus } from "@/generated/prisma/enums";

type Domain = {
  id: string;
  domain: string;
  status: DomainStatus;
  verifiedAt: Date | null;
  lastChecked: Date | null;
};

const STATUS_BADGE: Record<DomainStatus, string> = {
  VERIFIED: "bg-primary/10 text-primary",
  FAILED:   "bg-destructive/10 text-destructive",
  PENDING:  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const STATUS_ICON: Record<DomainStatus, React.ReactNode> = {
  VERIFIED: <CheckCircle2 className="h-3 w-3" />,
  FAILED:   <XCircle className="h-3 w-3" />,
  PENDING:  <Clock className="h-3 w-3" />,
};

const STATUS_LABEL: Record<DomainStatus, string> = {
  VERIFIED: "Verified",
  FAILED:   "DNS not found",
  PENDING:  "Pending verification",
};

const ICON_ACCENTS = [
  "bg-teal-500/10 text-teal-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
  "bg-sky-500/10 text-sky-600",
  "bg-rose-500/10 text-rose-600",
  "bg-emerald-500/10 text-emerald-600",
];

export function DomainList({ domains, appDomain }: { domains: Domain[]; appDomain: string }) {
  const [isPending, startTransition] = useTransition();

  function verify(id: string) {
    startTransition(async () => {
      const r = await verifyDomainAction(id);
      if (r.error) toast.error(r.error);
      else if (r.verified) toast.success("Domain verified!");
      else toast.error("DNS check failed — CNAME not found yet. Try again after propagation.");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const r = await removeDomainAction(id);
      if (r.error) toast.error(r.error);
      else toast.success("Domain removed.");
    });
  }

  if (!domains.length) {
    return <EmptyState icon={Globe} title="No custom domains yet" description="Add one to get started." className="py-16" />;
  }

  return (
    <div className="divide-y divide-border/60 rounded-lg border border-border">
      {domains.map((d, i) => {
        const accent = ICON_ACCENTS[i % ICON_ACCENTS.length];
        return (
          <div key={d.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium text-foreground">{d.domain}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[d.status]}`}
                    >
                      {STATUS_ICON[d.status]}
                      {STATUS_LABEL[d.status]}
                    </span>
                    {d.lastChecked && (
                      <span className="text-[11px] text-muted-foreground">
                        Checked{" "}
                        {new Date(d.lastChecked).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {d.status !== "VERIFIED" && (
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => verify(d.id)}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Verify
                  </Button>
                )}
                <ConfirmDialog
                  trigger={
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  }
                  title={`Remove ${d.domain}?`}
                  description="Links using this domain will fall back to the default short-link domain. This cannot be undone."
                  confirmLabel="Remove"
                  onConfirm={() => remove(d.id)}
                />
              </div>
            </div>

            {d.status !== "VERIFIED" && (
              <div className="mt-3 ml-12 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-mono">
                <div className="min-w-0 truncate">
                  <span className="text-muted-foreground">CNAME target: </span>
                  <span className="text-primary">{appDomain}</span>
                </div>
                <CopyButton value={appDomain} size="icon" label="" copiedLabel="" variant="ghost" ariaLabel="Copy CNAME target" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
