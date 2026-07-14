"use client";

import { FormEvent, useState } from "react";
import { Lock } from "lucide-react";

import { LoadingButton } from "@/components/shared/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";

type GuestPasswordFormProps = {
  slug: string;
};

export function GuestPasswordForm({ slug }: GuestPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/unlock/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to unlock link.");
        return;
      }

      window.location.href = `/${slug}`;
    } catch {
      setError("Unable to unlock link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-xl shadow-border/60">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>

        <CardTitle className="text-2xl text-foreground">
          Password required
        </CardTitle>

        <CardDescription>
          Enter the password to continue to this link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>

            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter link password"
              required
              className="mt-2 h-12"
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Unlocking..."
            className="h-12 w-full"
          >
            Unlock link
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}
