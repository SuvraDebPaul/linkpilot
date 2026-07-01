"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await changePasswordAction({
      currentPassword: fd.get("currentPassword"),
      newPassword: fd.get("newPassword"),
      confirmPassword: fd.get("confirmPassword"),
    });
    setIsPending(false);
    if (result.success) {
      toast.success(result.message);
      formRef.current?.reset();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" placeholder="Min. 8 characters" disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" disabled={isPending} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
