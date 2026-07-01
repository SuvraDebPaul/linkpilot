"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { registerAction } from "@/features/auth/actions/register.action";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/shared/form-error";
import { GoogleButton } from "@/features/auth/components/google-button";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (msgs?.[0]) errors[key] = msgs[0];
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);
    const result = await registerAction(raw);
    setIsPending(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const errors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.[0]) errors[key] = msgs[0];
        }
        setFieldErrors(errors);
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(result.message);
    router.push("/login");
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="name" />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="password" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="confirmPassword" />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
