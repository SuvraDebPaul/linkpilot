"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteWorkspaceAction } from "@/features/workspace/actions/workspace.actions";

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const canDelete = confirmText === workspaceName;

  function handleDelete() {
    if (!canDelete) return;
    startTransition(async () => {
      const result = await deleteWorkspaceAction(workspaceId, confirmText);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      // On success the action redirects — nothing else to do here.
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {workspaceName}?</DialogTitle>
          <DialogDescription>
            This permanently deletes every link, campaign, client portal, and custom domain in
            this workspace. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="confirm-workspace-name">
            Type <span className="font-semibold text-foreground">{workspaceName}</span> to confirm
          </Label>
          <Input
            id="confirm-workspace-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            disabled={isPending}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!canDelete || isPending}>
            {isPending ? "Deleting…" : "Delete workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
