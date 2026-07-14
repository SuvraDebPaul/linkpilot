"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { setPasswordAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrengthMeter } from "@/features/settings/components/password-strength-meter";

export function SetPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await setPasswordAction({
        newPassword: fd.get("newPassword"),
        confirmPassword: fd.get("confirmPassword"),
      });
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setNewPassword("");
        router.refresh();
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
      <p className="text-xs text-muted-foreground">
        Your account was created with Google sign-in and has no password yet. Set one to also enable
        email/password sign-in and two-factor authentication.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="setNewPassword">New password</Label>
        <PasswordInput
          id="setNewPassword"
          name="newPassword"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isPending}
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="setConfirmPassword">Confirm password</Label>
        <PasswordInput id="setConfirmPassword" name="confirmPassword" placeholder="••••••••" disabled={isPending} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Setting…" : "Set password"}
      </Button>
    </form>
  );
}
