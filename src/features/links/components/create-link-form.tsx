"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { createLinkAction } from "@/features/links/actions/link.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/shared/form-error";
import { LinkCreatedDialog } from "@/features/links/components/link-created-dialog";

function buildUtmUrl(base: string, params: Record<string, string>): string {
  if (!base) return "";
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([key, val]) => {
      if (val.trim()) url.searchParams.set(key, val.trim());
    });
    return url.toString();
  } catch {
    return base;
  }
}

export function CreateLinkForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdLink, setCreatedLink] = useState<{ id: string; shortCode: string } | null>(null);

  const [destinationUrl, setDestinationUrl] = useState("");
  const [showUtm, setShowUtm] = useState(false);
  const [utm, setUtm] = useState({
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });

  const assembledUrl = useMemo(
    () =>
      buildUtmUrl(destinationUrl, {
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        utm_term: utm.term,
        utm_content: utm.content,
      }),
    [destinationUrl, utm],
  );

  const hasUtmParams = Object.values(utm).some((v) => v.trim() !== "");
  const utmPreviewDiffers = assembledUrl && assembledUrl !== destinationUrl;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    const result = await createLinkAction({
      title: formData.get("title"),
      originalUrl: destinationUrl,
      customSlug: formData.get("customSlug"),
      password: formData.get("password"),
      expiresAt: formData.get("expiresAt"),
      maxClicks: formData.get("maxClicks"),
      notes: formData.get("notes"),
      tags: formData.get("tags"),
    });

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

    const id = result.data?.id as string | undefined;
    const shortCode = result.data?.shortCode as string | undefined;

    if (id && shortCode) {
      setCreatedLink({ id, shortCode });
    } else {
      router.push("/dashboard/links");
    }

    const remaining = result.data?.limitRemaining;
    if (typeof remaining === "number" && isFinite(remaining) && remaining <= 10 && remaining > 0) {
      setTimeout(() => {
        toast.info(
          remaining === 1
            ? "This was your last free link slot."
            : `${remaining} link${remaining !== 1 ? "s" : ""} left on your free plan.`,
          {
            description: "Upgrade to Starter for 500 links and 30-day analytics.",
            action: {
              label: "Upgrade",
              onClick: () => { window.location.href = "/dashboard/settings/billing"; },
            },
            duration: 8000,
          },
        );
      }, 1200);
    }
  }

  function resetForm() {
    setDestinationUrl("");
    setShowUtm(false);
    setUtm({ source: "", medium: "", campaign: "", term: "", content: "" });
    setFieldErrors({});
    setCreatedLink(null);
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — main fields */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Destination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="originalUrl">
                  URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="originalUrl"
                  name="originalUrl"
                  type="url"
                  placeholder="https://example.com/your-long-url"
                  disabled={isPending}
                  required
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <FieldError errors={fieldErrors} field="originalUrl" />
              </div>

              {/* UTM builder toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowUtm((p) => !p)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {showUtm ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showUtm ? "Hide UTM parameters" : "Add UTM parameters"}
                </button>

                {showUtm && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      UTM Parameters
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(
                        [
                          { key: "source", label: "Source", placeholder: "instagram", required: true },
                          { key: "medium", label: "Medium", placeholder: "social", required: true },
                          { key: "campaign", label: "Campaign", placeholder: "summer-sale", required: true },
                          { key: "term", label: "Term", placeholder: "running shoes", required: false },
                          { key: "content", label: "Content", placeholder: "hero-banner", required: false },
                        ] as const
                      ).map(({ key, label, placeholder, required }) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={`utm_${key}`} className="text-xs">
                            {label}{" "}
                            {required ? (
                              <span className="text-destructive">*</span>
                            ) : (
                              <span className="text-muted-foreground">(optional)</span>
                            )}
                          </Label>
                          <Input
                            id={`utm_${key}`}
                            placeholder={placeholder}
                            className="h-8 text-sm"
                            value={utm[key]}
                            onChange={(e) =>
                              setUtm((p) => ({ ...p, [key]: e.target.value }))
                            }
                            disabled={isPending}
                          />
                        </div>
                      ))}
                    </div>

                    {hasUtmParams && destinationUrl && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Preview</p>
                        <p className="break-all rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-foreground">
                          {assembledUrl}
                        </p>
                        {utmPreviewDiffers && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setDestinationUrl(assembledUrl)}
                          >
                            Apply to URL ↑
                          </Button>
                        )}
                      </div>
                    )}

                    {hasUtmParams && !destinationUrl && (
                      <p className="text-xs text-muted-foreground">
                        Enter a destination URL above to see the preview.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Summer campaign homepage"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">
                  Tags{" "}
                  <span className="text-xs text-muted-foreground">(comma-separated)</span>
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g. social, launch, q4"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Notes{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Internal notes about this link — not visible to visitors"
                  disabled={isPending}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons — side by side under Details */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard/links")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating…" : "Create link"}
            </Button>
          </div>
        </div>

        {/* Right column — settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Short link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customSlug">
                  Custom slug{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="customSlug"
                  name="customSlug"
                  placeholder="e.g. summer-sale"
                  disabled={isPending}
                />
                <FieldError errors={fieldErrors} field="customSlug" />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security &amp; limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Visitors must enter this to access the link
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">
                  Expiry date{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  disabled={isPending}
                />
                <FieldError errors={fieldErrors} field="expiresAt" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxClicks">
                  Max clicks{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="maxClicks"
                  name="maxClicks"
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  disabled={isPending}
                />
                <FieldError errors={fieldErrors} field="maxClicks" />
                <p className="text-xs text-muted-foreground">
                  Link deactivates after this many clicks
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </form>

    {createdLink && (
      <LinkCreatedDialog
        open={!!createdLink}
        shortCode={createdLink.shortCode}
        linkId={createdLink.id}
        onClose={() => {
          setCreatedLink(null);
          router.push("/dashboard/links");
        }}
        onCreateAnother={() => {
          resetForm();
        }}
      />
    )}
    </>
  );
}
