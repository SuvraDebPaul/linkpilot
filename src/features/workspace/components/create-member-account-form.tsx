"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createMemberAccountAction } from "@/features/workspace/actions/workspace.actions";

export function CreateMemberAccountForm({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    setIsPending(true);
    const result = await createMemberAccountAction({ workspaceId, name, email, password });
    setIsPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Account created.");
    setCreated({ email, password });
  }

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) setCreated(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <KeyRound className="h-3.5 w-3.5" /> Create account manually
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create a member account</DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Share these credentials with your teammate securely (they can sign in immediately and verify
              their email later — that step is optional):
            </p>
            <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
              <p>Email: {created.email}</p>
              <p>Password: {created.password}</p>
            </div>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Sets up a login directly, without sending an invite email. You choose the password and share it
              with them yourself.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="cma-name">Name</Label>
              <Input id="cma-name" name="name" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cma-email">Email</Label>
              <Input id="cma-email" name="email" type="email" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cma-password">Password</Label>
              <Input id="cma-password" name="password" type="text" placeholder="Min. 8 characters" required disabled={isPending} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create account"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
