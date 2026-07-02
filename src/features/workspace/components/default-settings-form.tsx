"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateWorkspaceDefaultsAction } from "@/features/workspace/actions/workspace.actions";

type SlugStyle = "incremental" | "random" | "secure";
type RedirectType = "301" | "302" | "307" | "308";

const SLUG_OPTIONS: { value: SlugStyle; label: string; sub: string }[] = [
  { value: "incremental", label: "Incremental", sub: "Slugs follow each other in order" },
  { value: "random", label: "Random", sub: "Slugs will contain 6 random characters" },
  { value: "secure", label: "Secure", sub: "Slugs will contain 12 random characters" },
];

const REDIRECT_OPTIONS: { value: RedirectType; label: string }[] = [
  { value: "301", label: "301 Permanent — for pages moved permanently" },
  { value: "302", label: "302 Standard — default behavior" },
  { value: "307", label: "307 Standard — for forms submission" },
  { value: "308", label: "308 Permanent — for forms submission with permanent redirect" },
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Slug style */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Slug generator rule</p>
        <p className="text-xs text-muted-foreground">Examples: linkpilot.com/fipBMz</p>
        <div className="space-y-1.5 pt-1">
          {SLUG_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50"
            >
              <input
                type="radio"
                name="slugStyle"
                checked={slugStyle === opt.value}
                onChange={() => setSlugStyle(opt.value)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                <span className="block text-xs text-muted-foreground">{opt.sub}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Redirect rule */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Redirect rule</p>
        <div className="space-y-1.5 pt-1">
          {REDIRECT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50"
            >
              <input
                type="radio"
                name="redirectType"
                checked={redirectType === opt.value}
                onChange={() => setRedirectType(opt.value)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cloaking */}
      <div className="flex items-center justify-between gap-4 lg:col-span-2">
        <div>
          <p className="text-sm font-medium text-foreground">Cloaking enabled by default</p>
          <p className="text-xs text-muted-foreground">Hide the destination URL behind the short link for new links.</p>
        </div>
        <Switch checked={cloaking} onCheckedChange={setCloaking} />
      </div>

      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
