"use client";

import { signOut } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

import { deleteAccountAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function DangerZone() {
  async function handleDelete() {
    try {
      const result = await deleteAccountAction();
      if (result.success) {
        toast.success("Account deleted.");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong deleting your account. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Permanently delete your account and all associated links. This cannot be undone.
      </p>
      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        }
        title="Delete your account?"
        description="This will permanently delete your account, all your links, campaigns, and analytics. This cannot be undone."
        confirmLabel="Yes, delete my account"
        onConfirm={handleDelete}
      />
    </div>
  );
}
