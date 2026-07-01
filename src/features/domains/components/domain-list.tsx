"use client";

import React, { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyDomainAction, removeDomainAction } from "@/features/domains/actions/domain.actions";
import type { DomainStatus } from "@/generated/prisma/enums";

type Domain = {
  id: string;
  domain: string;
  status: DomainStatus;
  verifiedAt: Date | null;
  lastChecked: Date | null;
};

const STATUS_ICON: Record<DomainStatus, React.ReactNode> = {
  VERIFIED: <CheckCircle2 className="h-4 w-4 text-primary" />,
  FAILED:   <XCircle className="h-4 w-4 text-destructive" />,
  PENDING:  <Clock className="h-4 w-4 text-amber-500" />,
};

const STATUS_LABEL: Record<DomainStatus, string> = {
  VERIFIED: "Verified",
  FAILED:   "DNS not found",
  PENDING:  "Pending verification",
};

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
    return <p className="py-6 text-center text-sm text-muted-foreground">No custom domains yet. Add one above.</p>;
  }

  return (
    <div className="divide-y divide-border/50 rounded-lg border border-border">
      {domains.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">{d.domain}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {STATUS_ICON[d.status]}
              <span>{STATUS_LABEL[d.status]}</span>
              {d.lastChecked && (
                <span className="text-muted-foreground">· checked {new Date(d.lastChecked).toLocaleString()}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {d.status !== "VERIFIED" && (
              <Button size="sm" variant="outline" disabled={isPending} onClick={() => verify(d.id)}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Verify
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={isPending} onClick={() => remove(d.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
