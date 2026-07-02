"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FieldError, FormError } from "@/components/shared/form-error";
import { GoogleButton } from "@/features/auth/components/google-button";
import { loginSchema } from "@/features/auth/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const verified = searchParams.get("verified") === "1";
  const tokenError = searchParams.get("error");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [savedCreds, setSavedCreds] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = { email: formData.get("email"), password: formData.get("password") };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (msgs?.[0]) errors[key] = msgs[0];
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    setIsPending(false);

    if (result?.error === "2FA_REQUIRED") {
      setSavedCreds({ email: parsed.data.email, password: parsed.data.password });
      setOtpRequired(true);
      return;
    }

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!savedCreds) return;
    setError(null);
    setIsPending(true);

    const result = await signIn("credentials", {
      email: savedCreds.email,
      password: savedCreds.password,
      otp,
      redirect: false,
    });

    setIsPending(false);

    if (result?.error) {
      setError("Incorrect authentication code.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  if (otpRequired) {
    return (
      <div className="space-y-5">
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <FormError message={error} />
          <div className="space-y-1.5">
            <Label htmlFor="otp">Two-factor code</Label>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app, or a backup code.
            </p>
            <Input
              id="otp"
              name="otp"
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !otp.trim()}>
            {isPending ? "Verifying…" : "Verify and sign in"}
          </Button>
          <button
            type="button"
            onClick={() => { setOtpRequired(false); setSavedCreds(null); setOtp(""); setError(null); }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {verified && (
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          Email verified! You can now sign in.
        </p>
      )}
      {tokenError === "expired-token" && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Verification link has expired. Please register again.
        </p>
      )}
      <GoogleButton callbackUrl={callbackUrl} label="Sign in with Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="email" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="password" />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
