"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Mail, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendInviteAction, revokeInviteAction } from "@/features/workspace/actions/workspace.actions";

type Invite = { email: string; expires: Date };

export function PendingInvitesList({ workspaceId, invites }: { workspaceId: string; invites: Invite[] }) {
  const [isPending, startTransition] = useTransition();

  function resend(email: string) {
    startTransition(async () => {
      const r = await resendInviteAction(workspaceId, email);
      if (r.error) toast.error(r.error);
      else toast.success("Invite resent.");
    });
  }

  function revoke(email: string) {
    startTransition(async () => {
      const r = await revokeInviteAction(workspaceId, email);
      if (r.error) toast.error(r.error);
      else toast.success("Invite revoked.");
    });
  }

  if (invites.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {invites.map((invite) => {
        const isExpired = invite.expires < new Date();
        return (
          <div
            key={invite.email}
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm text-foreground">{invite.email}</span>
              <span className={`shrink-0 text-xs ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                {isExpired ? "Expired" : `Expires ${invite.expires.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isPending}
                onClick={() => resend(invite.email)}
                title="Resend invite"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={isPending}
                onClick={() => revoke(invite.email)}
                title="Revoke invite"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
