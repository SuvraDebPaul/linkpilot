"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { createLinkAction } from "@/features/links/actions/link.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/shared/form-error";

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

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Controlled URL field + UTM builder state
  const [destinationUrl, setDestinationUrl] = useState("");
  const [showUtm, setShowUtm] = useState(false);
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });

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

  function applyUtmToUrl() {
    if (assembledUrl) setDestinationUrl(assembledUrl);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setDestinationUrl("");
      setShowUtm(false);
      setUtm({ source: "", medium: "", campaign: "", term: "", content: "" });
      setFieldErrors({});
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    // Use controlled URL value (may have UTM params applied)
    formData.set("originalUrl", destinationUrl);

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

    toast.success(result.message);
    handleOpenChange(false);

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
          }
        );
      }, 1200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New link
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label htmlFor="originalUrl">Destination URL <span className="text-destructive">*</span></Label>
            <Input
              id="originalUrl"
              name="originalUrl"
              type="url"
              placeholder="https://example.com/your-long-url"
              disabled={isPending}
              required
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
            <FieldError errors={fieldErrors} field="originalUrl" />

            {/* UTM builder toggle */}
            <button
              type="button"
              onClick={() => setShowUtm((p) => !p)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {showUtm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showUtm ? "Hide UTM parameters" : "Add UTM parameters"}
            </button>
          </div>

          {/* UTM builder panel */}
          {showUtm && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">UTM Parameters</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="utm_source" className="text-xs">Source <span className="text-destructive">*</span></Label>
                  <Input
                    id="utm_source"
                    placeholder="e.g. instagram"
                    className="h-8 text-sm"
                    value={utm.source}
                    onChange={(e) => setUtm((p) => ({ ...p, source: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utm_medium" className="text-xs">Medium <span className="text-destructive">*</span></Label>
                  <Input
                    id="utm_medium"
                    placeholder="e.g. social"
                    className="h-8 text-sm"
                    value={utm.medium}
                    onChange={(e) => setUtm((p) => ({ ...p, medium: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utm_campaign" className="text-xs">Campaign <span className="text-destructive">*</span></Label>
                  <Input
                    id="utm_campaign"
                    placeholder="e.g. summer-sale"
                    className="h-8 text-sm"
                    value={utm.campaign}
                    onChange={(e) => setUtm((p) => ({ ...p, campaign: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="utm_term" className="text-xs">Term <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="utm_term"
                    placeholder="e.g. running shoes"
                    className="h-8 text-sm"
                    value={utm.term}
                    onChange={(e) => setUtm((p) => ({ ...p, term: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="utm_content" className="text-xs">Content <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="utm_content"
                    placeholder="e.g. hero-banner"
                    className="h-8 text-sm"
                    value={utm.content}
                    onChange={(e) => setUtm((p) => ({ ...p, content: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Live preview + apply */}
              {hasUtmParams && destinationUrl && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground font-medium">Preview</p>
                  <p className="break-all rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-foreground">
                    {assembledUrl}
                  </p>
                  {utmPreviewDiffers && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={applyUtmToUrl}
                    >
                      Apply to URL ↑
                    </Button>
                  )}
                </div>
              )}

              {hasUtmParams && !destinationUrl && (
                <p className="text-xs text-muted-foreground">Enter a destination URL above to see the preview.</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Summer campaign homepage"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customSlug">Custom slug <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input
              id="customSlug"
              name="customSlug"
              placeholder="e.g. summer-sale"
              disabled={isPending}
            />
            <FieldError errors={fieldErrors} field="customSlug" />
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expires <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" disabled={isPending} />
              <FieldError errors={fieldErrors} field="expiresAt" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxClicks">Max clicks <span className="text-muted-foreground text-xs">(optional — link deactivates after this many clicks)</span></Label>
            <Input id="maxClicks" name="maxClicks" type="number" min="1" placeholder="e.g. 100" disabled={isPending} />
            <FieldError errors={fieldErrors} field="maxClicks" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input id="tags" name="tags" placeholder="e.g. social, launch, q4" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="notes" name="notes" placeholder="Internal notes about this link" disabled={isPending} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
