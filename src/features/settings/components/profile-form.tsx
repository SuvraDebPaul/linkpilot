"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ name, email }: { name: string | null; email: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateProfileAction({ name: fd.get("name") });
    setIsPending(false);
    result.success ? toast.success(result.message) : toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={name ?? ""} disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly className="bg-muted/50 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
