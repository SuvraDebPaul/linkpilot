"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, ArrowRightLeft, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TypedConfirmDialog } from "@/components/shared/typed-confirm-dialog";
import {
  suspendWorkspaceAction,
  forceTransferOwnershipAction,
  forceDeleteWorkspaceAction,
} from "@/features/admin/actions/admin-workspaces.actions";

export function WorkspaceActionsPanel({
  workspaceId,
  slug,
  suspended,
  members,
}: {
  workspaceId: string;
  slug: string;
  suspended: boolean;
  members: { userId: string; label: string }[];
}) {
  const router = useRouter();
  const [transferTo, setTransferTo] = useState<string>("");

  async function handleToggleSuspend() {
    const result = await suspendWorkspaceAction(workspaceId, !suspended);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleTransfer() {
    if (!transferTo) return;
    const result = await forceTransferOwnershipAction(workspaceId, transferTo);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDelete() {
    const result = await forceDeleteWorkspaceAction(workspaceId);
    if (result.success) {
      toast.success(result.message);
      router.push("/admin/workspaces");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-4">
      <h2 className="text-sm font-semibold text-zinc-100">Admin actions</h2>

      <div className="mt-3 flex items-center gap-2">
        <Select value={transferTo} onValueChange={setTransferTo}>
          <SelectTrigger className="w-64 border-white/10 bg-zinc-900 text-zinc-100">
            <SelectValue placeholder="Transfer ownership to…" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5 text-foreground" disabled={!transferTo}>
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Transfer
            </Button>
          }
          title="Transfer ownership?"
          description="The current owner(s) will be demoted to Admin, and the selected member becomes the new Owner."
          confirmLabel="Transfer ownership"
          variant="default"
          onConfirm={handleTransfer}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5 text-foreground">
              <Ban className="h-3.5 w-3.5" />
              {suspended ? "Unsuspend" : "Suspend"}
            </Button>
          }
          title={suspended ? "Unsuspend this workspace?" : "Suspend this workspace?"}
          description={
            suspended
              ? "Members will immediately regain access."
              : "Every member will be blocked from accessing this workspace until unsuspended."
          }
          confirmLabel={suspended ? "Unsuspend" : "Suspend"}
          variant={suspended ? "default" : "destructive"}
          onConfirm={handleToggleSuspend}
        />
        <TypedConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete workspace
            </Button>
          }
          title="Delete this workspace permanently?"
          description="This deletes the workspace and all of its links, campaigns, and domains. This cannot be undone."
          confirmText={slug}
          confirmLabel="Delete permanently"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
