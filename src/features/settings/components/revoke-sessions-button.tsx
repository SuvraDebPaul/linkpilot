"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { revokeAllSessionsAction } from "@/features/settings/actions/security.actions";

export function RevokeSessionsButton() {
  const [pending, setPending] = useState(false);

  async function handleRevoke() {
    setPending(true);
    const result = await revokeAllSessionsAction();
    if (!result.success) {
      setPending(false);
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="gap-1.5" disabled={pending}>
          <LogOut className="h-3.5 w-3.5" /> Revoke all sessions
        </Button>
      }
      title="Log out of all sessions?"
      description="This will sign you out of every device, including this one. You'll need to sign in again."
      confirmLabel="Revoke all"
      onConfirm={handleRevoke}
    />
  );
}
