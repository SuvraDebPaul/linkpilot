"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, EyeOff, Eye, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateWorkspaceDefaultsAction } from "@/features/workspace/actions/workspace.actions";

type SlugStyle = "incremental" | "random" | "secure";
type RedirectType = "301" | "302" | "307" | "308";

const SLUG_OPTIONS: { value: SlugStyle; label: string; sub: string; example: string }[] = [
  { value: "incremental", label: "Incremental", sub: "Slugs follow each other in order", example: "7" },
  { value: "random", label: "Random", sub: "Slugs will contain 6 random characters", example: "fipBMz" },
  { value: "secure", label: "Secure", sub: "Slugs will contain 12 random characters", example: "aZ3kLp9qXrTd" },
];

const REDIRECT_OPTIONS: { value: RedirectType; code: string; label: string }[] = [
  { value: "301", code: "301", label: "Permanent — for pages moved permanently" },
  { value: "302", code: "302", label: "Standard — default behavior" },
  { value: "307", code: "307", label: "Standard — for forms submission" },
  { value: "308", code: "308", label: "Permanent — for forms submission with redirect" },
];

export function DefaultSettingsForm({
  workspaceId,
  initialSlugStyle,
  initialRedirectType,
  initialCloaking,
}: {
  workspaceId: string;
  initialSlugStyle: string;
  initialRedirectType: string;
  initialCloaking: boolean;
}) {
  const [slugStyle, setSlugStyle] = useState<SlugStyle>(initialSlugStyle as SlugStyle);
  const [redirectType, setRedirectType] = useState<RedirectType>(initialRedirectType as RedirectType);
  const [cloaking, setCloaking] = useState(initialCloaking);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateWorkspaceDefaultsAction({
      workspaceId,
      slugStyle,
      defaultRedirectType: redirectType,
      defaultCloakingEnabled: cloaking,
    });
    setSaving(false);
    if (result.success) toast.success("Default settings saved.");
    else toast.error(result.error ?? "Failed to save.");
  }

  const activeSlugExample = SLUG_OPTIONS.find((o) => o.value === slugStyle)?.example ?? "fipBMz";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link defaults</CardTitle>
          <CardDescription>Slug style, redirect behavior, and cloaking for new links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Slug style */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Slug generator rule</p>
            <RadioGroup
              value={slugStyle}
              onValueChange={(v) => setSlugStyle(v as SlugStyle)}
              className="grid gap-2 pt-1 sm:grid-cols-3"
            >
              {SLUG_OPTIONS.map((opt) => {
                const isActive = slugStyle === opt.value;
                return (
                  <label
                    key={opt.value}
                    htmlFor={`slug-${opt.value}`}
                    onClick={() => setSlugStyle(opt.value)}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-1 rounded-lg border-2 px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={`slug-${opt.value}`} className="sr-only" />
                    {isActive && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                    <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.sub}</span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Redirect rule */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Redirect rule</p>
            <RadioGroup
              value={redirectType}
              onValueChange={(v) => setRedirectType(v as RedirectType)}
              className="grid gap-2 pt-1 sm:grid-cols-2"
            >
              {REDIRECT_OPTIONS.map((opt) => {
                const isActive = redirectType === opt.value;
                return (
                  <label
                    key={opt.value}
                    htmlFor={`redirect-${opt.value}`}
                    onClick={() => setRedirectType(opt.value)}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-2.5 rounded-lg border-2 px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={`redirect-${opt.value}`} className="sr-only" />
                    {isActive && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-foreground">
                      {opt.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{opt.label}</span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Cloaking */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Cloaking enabled by default</p>
              <p className="text-xs text-muted-foreground">Hide the destination URL behind the short link for new links.</p>
            </div>
            <Switch checked={cloaking} onCheckedChange={setCloaking} />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>What a new link will look like with these defaults.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate text-sm font-medium text-foreground">
              linkpilot.com/{activeSlugExample}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slug style</span>
              <span className="font-semibold capitalize text-foreground">{slugStyle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Redirect type</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-bold text-foreground">{redirectType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Destination URL</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                {cloaking ? (
                  <>
                    <EyeOff className="h-3 w-3" /> Hidden
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" /> Visible
                  </>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
