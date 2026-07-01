"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameWorkspaceAction } from "@/features/workspace/actions/workspace.actions";

export function RenameWorkspaceForm({ workspaceId, currentName }: { workspaceId: string; currentName: string }) {
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await renameWorkspaceAction(fd);
      if (result.error) toast.error(result.error);
      else toast.success("Workspace renamed.");
    });
  }

  return (
    <form ref={ref} onSubmit={handleSubmit} className="flex gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Input name="name" defaultValue={currentName} maxLength={60} className="max-w-xs" disabled={isPending} />
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
