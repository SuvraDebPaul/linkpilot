"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Link2, Lock, Timer } from "lucide-react";

import { FormError } from "@/components/shared/form-error";
import { LoadingButton } from "@/components/shared/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { guestLinkExpiryOptions } from "@/features/guest-links/constants/guest-link.constants";
import { GuestLinkResult } from "@/features/guest-links/components/guest-link-result";
import type {
  CreateGuestLinkResponse,
  GuestLinkExpiryPreset,
} from "@/features/guest-links/types/guest-link.types";
import { toast } from "sonner";

export function GuestLinkForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiryPreset, setExpiryPreset] = useState<GuestLinkExpiryPreset>("7d");
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<CreateGuestLinkResponse["data"] | null>(
    null,
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    NonNullable<CreateGuestLinkResponse["fieldErrors"]>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setResult(null);

    try {
      const response = await fetch("/api/guest-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          expiryPreset,
          password: enablePassword ? password : "",
        }),
      });

      const payload = (await response.json()) as CreateGuestLinkResponse;

      if (!response.ok || !payload.success || !payload.data) {
        const message =
          payload.message || "Something went wrong. Please try again.";

        setError(message);
        setFieldErrors(payload.fieldErrors || {});
        toast.error(message);
        return;
      }

      setResult(payload.data);
      toast.success("Temporary short link created successfully.");
      setOriginalUrl("");
      setPassword("");
      setEnablePassword(false);
      setExpiryPreset("7d");
    } catch {
      const message = "Unable to create link. Please check your connection.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-2xl shadow-border/50 backdrop-blur">
      <CardHeader className="border-b border-border/50 bg-linear-to-br from-card to-muted/40">
        <div className="mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            No login required
          </Badge>
        </div>

        <CardTitle className="text-2xl text-foreground">
          Try LinkPilot with a free short link
        </CardTitle>

        <CardDescription className="text-muted-foreground">
          Create a quick short link with expiry, optional password protection,
          and QR code. Sign up later to manage permanent links, campaigns,
          analytics, and reports.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="originalUrl" className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Long URL
            </Label>

            <Input
              id="originalUrl"
              type="url"
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              placeholder="https://example.com/your-long-link"
              required
              className="mt-2 h-12"
            />

            <FormError message={fieldErrors.originalUrl?.[0]} />
          </div>

          <div>
            <Label htmlFor="expiryPreset" className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              Expiry
            </Label>

            <Select
              value={expiryPreset}
              onValueChange={(value) =>
                setExpiryPreset(value as GuestLinkExpiryPreset)
              }
            >
              <SelectTrigger id="expiryPreset" className="mt-2 h-12 w-full">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>

              <SelectContent>
                {guestLinkExpiryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="mt-2 text-xs text-muted-foreground">
              Free links are automatically deleted after 7 days.
            </p>

            <FormError message={fieldErrors.expiryPreset?.[0]} />
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="enablePassword"
                checked={enablePassword}
                onCheckedChange={(checked) =>
                  setEnablePassword(Boolean(checked))
                }
                className="mt-1"
              />

              <div>
                <Label
                  htmlFor="enablePassword"
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Lock className="h-4 w-4 text-primary" />
                  Protect this link with password
                </Label>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Visitors must enter the password before being redirected.
                </p>
              </div>
            </div>

            {enablePassword ? (
              <div className="mt-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="h-11"
                />

                <FormError message={fieldErrors.password?.[0]} />
              </div>
            ) : null}
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Creating link..."
            className="h-12 w-full rounded-xl bg-primary shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary hover:shadow-xl hover:shadow-primary/25"
          >
            Create free short link
          </LoadingButton>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs font-semibold text-primary">
              Want permanent links with analytics?
            </p>
            <p className="mt-1 text-xs leading-5 text-primary">
              A free account gives you <strong>50 managed links</strong>,{" "}
              <strong>2 campaigns</strong>, and{" "}
              <strong>basic click analytics</strong> — no card required.
            </p>
          </div>
        </form>

        {result ? <GuestLinkResult result={result} /> : null}
      </CardContent>
    </Card>
  );
}
