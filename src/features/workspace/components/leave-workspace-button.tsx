"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { leaveWorkspaceAction } from "@/features/workspace/actions/workspace.actions";

export function LeaveWorkspaceButton({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveWorkspaceAction(workspaceId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`You left ${workspaceName}.`);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" disabled={isPending}>
          <LogOut className="h-4 w-4" /> Leave workspace
        </Button>
      }
      title={`Leave ${workspaceName}?`}
      description="You'll lose access to this workspace's links, campaigns, and reports immediately. Someone else can re-invite you later."
      confirmLabel="Leave workspace"
      onConfirm={handleLeave}
    />
  );
}
