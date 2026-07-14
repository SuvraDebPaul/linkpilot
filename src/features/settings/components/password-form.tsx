"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { changePasswordAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrengthMeter } from "@/features/settings/components/password-strength-meter";

export function PasswordForm() {
  const [isPending, setIsPending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await changePasswordAction({
        currentPassword: fd.get("currentPassword"),
        newPassword: fd.get("newPassword"),
        confirmPassword: fd.get("confirmPassword"),
      });
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setNewPassword("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput id="currentPassword" name="currentPassword" placeholder="••••••••" disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isPending}
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="••••••••" disabled={isPending} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
