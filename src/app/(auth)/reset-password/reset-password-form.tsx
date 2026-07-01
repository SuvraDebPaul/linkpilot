"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/shared/form-error";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="space-y-3 text-center">
        <FormError message="Invalid or missing reset token." />
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Request a new link</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setIsPending(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setIsPending(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Your link may have expired.");
      return;
    }

    toast.success("Password updated! You can now sign in.");
    router.push("/login");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Set new password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormError message={error} />}
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={8} placeholder="Min. 8 characters" disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" required placeholder="••••••••" disabled={isPending} />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
