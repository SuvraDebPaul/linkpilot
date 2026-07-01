"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteMemberAction } from "@/features/workspace/actions/workspace.actions";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await inviteMemberAction(fd);
      if (result.error) toast.error(result.error);
      else { toast.success("Invite sent!"); form.reset(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Input
        name="email"
        type="email"
        placeholder="colleague@example.com"
        className="max-w-xs"
        disabled={isPending}
        required
      />
      <Button type="submit" disabled={isPending}>{isPending ? "Sending…" : "Send invite"}</Button>
    </form>
  );
}
