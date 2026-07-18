"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/shared/password-input";
import { FieldError, FormError } from "@/components/shared/form-error";
import { GoogleButton } from "@/features/auth/components/google-button";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { resendVerificationAction } from "@/features/auth/actions/resend-verification.action";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const verified = searchParams.get("verified") === "1";
  const tokenError = searchParams.get("error");

  const oauthErrorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
      "That email is already registered. Sign in with your password, then link Google from account settings.",
    AccessDenied: "Access denied. Please try again or use a different account.",
    Configuration: "Sign-in is misconfigured. Please contact support.",
  };
  const oauthError = tokenError ? oauthErrorMessages[tokenError] : null;

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setUnverifiedEmail(null);
    setResendState("idle");

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

    if (result?.error === "EmailNotVerified") {
      setUnverifiedEmail(parsed.data.email);
      return;
    }

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    setResendState("sending");
    await resendVerificationAction(unverifiedEmail);
    setResendState("sent");
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
      {oauthError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {oauthError}
        </p>
      )}
      <GoogleButton callbackUrl={callbackUrl} label="Sign in with Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {unverifiedEmail && (
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p>Please verify your email before signing in. Check your inbox for the link we sent to {unverifiedEmail}.</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState !== "idle"}
              className="mt-1.5 font-medium underline underline-offset-2 disabled:no-underline disabled:opacity-70"
            >
              {resendState === "sent"
                ? "Verification email sent — check your inbox"
                : resendState === "sending"
                  ? "Sending…"
                  : "Resend verification email"}
            </button>
          </div>
        )}
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
          <PasswordInput
            id="password"
            name="password"
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
