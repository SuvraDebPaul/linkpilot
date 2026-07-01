"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, Sparkles, Zap, FolderKanban, Palette, Globe, FileText, Hash } from "lucide-react";
import { toast } from "sonner";

import { createLinkAction } from "@/features/links/actions/link.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/shared/form-error";
import { LinkCreatedDialog } from "@/features/links/components/link-created-dialog";
import { LinkLivePreview } from "@/features/links/components/link-live-preview";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { PlanTier } from "@/lib/plans";

type EcLevel = "L" | "M" | "Q" | "H";
type RedirectType = "301" | "302" | "307";

const REDIRECT_OPTIONS: { value: RedirectType; label: string; hint: string }[] = [
  { value: "302", label: "302 Temporary", hint: "Default — re-checks every visit" },
  { value: "301", label: "301 Permanent", hint: "Best for SEO, cached forever" },
  { value: "307", label: "307 Strict", hint: "Preserves HTTP method" },
];

const EC_LEVELS: { value: EcLevel; label: string }[] = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "Q", label: "Q" },
  { value: "H", label: "H" },
];

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

type Campaign = { id: string; name: string };
type VerifiedDomain = { id: string; domain: string };

type Props = {
  plan: PlanTier;
  campaigns: Campaign[];
  verifiedDomains: VerifiedDomain[];
};

export function CreateLinkForm({ plan, campaigns, verifiedDomains }: Props) {
  const isPaidPlan = plan === "starter" || plan === "pro";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdLink, setCreatedLink] = useState<{ id: string; shortCode: string } | null>(null);

  const [destinationUrl, setDestinationUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [customDomainId, setCustomDomainId] = useState("");
  const [showUtm, setShowUtm] = useState(false);
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });

  const [redirectType, setRedirectType] = useState<RedirectType>("302");
  const [fgColor, setFgColor] = useState("#0d9488");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<EcLevel>("M");

  const selectedDomain = verifiedDomains.find((d) => d.id === customDomainId)?.domain;

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
      customSlug,
      password: formData.get("password"),
      expiresAt: formData.get("expiresAt"),
      maxClicks: formData.get("maxClicks"),
      notes: formData.get("notes"),
      tags: formData.get("tags"),
      campaignId,
      customDomainId,
      redirectType: isPaidPlan ? redirectType : undefined,
      qrFgColor: isPaidPlan ? fgColor : undefined,
      qrBgColor: isPaidPlan ? bgColor : undefined,
      qrEcLevel: isPaidPlan ? ecLevel : undefined,
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
    setCustomSlug("");
    setCampaignId("");
    setCustomDomainId("");
    setShowUtm(false);
    setUtm({ source: "", medium: "", campaign: "", term: "", content: "" });
    setRedirectType("302");
    setFgColor("#0d9488");
    setBgColor("#ffffff");
    setEcLevel("M");
    setFieldErrors({});
    setCreatedLink(null);
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Left column — main fields */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Destination
              </CardTitle>
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
                  {showUtm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
                            onChange={(e) => setUtm((p) => ({ ...p, [key]: e.target.value }))}
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
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input id="title" name="title" placeholder="e.g. Summer campaign homepage" disabled={isPending} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">
                  Tags <span className="text-xs text-muted-foreground">(comma-separated)</span>
                </Label>
                <Input id="tags" name="tags" placeholder="e.g. social, launch, q4" disabled={isPending} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Notes <span className="text-xs text-muted-foreground">(optional)</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="h-4 w-4 text-primary" />
                Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={campaignId || "none"} onValueChange={(v) => setCampaignId(v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No campaign</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Group this link with others to compare channel performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Security &amp; limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" disabled={isPending} />
                <p className="text-xs text-muted-foreground">Visitors must enter this to access the link</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">
                  Expiry date <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input id="expiresAt" name="expiresAt" type="datetime-local" disabled={isPending} />
                <FieldError errors={fieldErrors} field="expiresAt" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxClicks">
                  Max clicks <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input id="maxClicks" name="maxClicks" type="number" min="1" placeholder="e.g. 100" disabled={isPending} />
                <FieldError errors={fieldErrors} field="maxClicks" />
                <p className="text-xs text-muted-foreground">Link deactivates after this many clicks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — live preview + settings */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Short link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customSlug" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  Custom slug <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="customSlug"
                  name="customSlug"
                  placeholder="e.g. summer-sale"
                  disabled={isPending}
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
                <FieldError errors={fieldErrors} field="customSlug" />
                <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
              </div>

              {verifiedDomains.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="customDomain" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Domain
                  </Label>
                  <Select value={customDomainId || "default"} onValueChange={(v) => setCustomDomainId(v === "default" ? "" : v)}>
                    <SelectTrigger id="customDomain" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{siteConfig.url.replace(/^https?:\/\//, "")} (default)</SelectItem>
                      {verifiedDomains.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <LinkLivePreview
                slug={customSlug}
                fgColor={isPaidPlan ? fgColor : "#000000"}
                bgColor={isPaidPlan ? bgColor : "#ffffff"}
                ecLevel={isPaidPlan ? ecLevel : "M"}
                margin={2}
                customDomain={selectedDomain}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4 text-primary" />
                  Style &amp; redirect
                </CardTitle>
                {!isPaidPlan && <Badge variant="secondary" className="text-xs">Starter+</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!isPaidPlan ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">Custom QR colors &amp; redirect type</p>
                  <p className="text-xs text-muted-foreground">
                    Pick your own QR colors and choose 301/302/307 redirects. Available on Starter and Pro.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings/billing">Upgrade</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Redirect type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">HTTP redirect</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {REDIRECT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRedirectType(opt.value)}
                          title={opt.hint}
                          className={cn(
                            "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                            redirectType === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          {opt.value}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {REDIRECT_OPTIONS.find((o) => o.value === redirectType)?.hint}
                    </p>
                  </div>

                  {/* QR colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">QR color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                        />
                        <Input
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-8 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-8 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EC level */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Error correction</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {EC_LEVELS.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setEcLevel(lvl.value)}
                          className={cn(
                            "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                            ecLevel === lvl.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action bar — closes out the whole form, not just one column */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/links")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? "Creating…" : "Create link"}
        </Button>
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
