"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setPasswordAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const result = await setPasswordAction({
      newPassword: fd.get("newPassword"),
      confirmPassword: fd.get("confirmPassword"),
    });
    setIsPending(false);
    if (result.success) {
      toast.success(result.message);
      formRef.current?.reset();
      setNewPassword("");
      router.refresh();
    } else {
      toast.error(result.message);
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
        <Input
          id="setNewPassword"
          name="newPassword"
          type="password"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isPending}
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="setConfirmPassword">Confirm password</Label>
        <Input id="setConfirmPassword" name="confirmPassword" type="password" placeholder="••••••••" disabled={isPending} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Setting…" : "Set password"}
      </Button>
    </form>
  );
}
