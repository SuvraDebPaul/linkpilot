"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateWorkspaceBrandingAction } from "@/features/workspace/actions/workspace.actions";

type Props = {
  workspaceId: string;
  isPro: boolean;
  initialLogoUrl: string;
  initialColor: string;
  initialHideBranding: boolean;
};

export function WorkspaceBrandingForm({
  workspaceId,
  isPro,
  initialLogoUrl,
  initialColor,
  initialHideBranding,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [color, setColor] = useState(initialColor || "#0d9488");
  const [hideBranding, setHideBranding] = useState(initialHideBranding);
  const colorTextRef = useRef<HTMLInputElement>(null);

  function handleColorPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setColor(e.target.value);
  }

  function handleColorTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setColor(val);
  }

  async function handleSave() {
    setIsPending(true);
    const result = await updateWorkspaceBrandingAction({
      workspaceId,
      brandLogoUrl: logoUrl,
      brandColor: color === "#0d9488" && !initialColor ? "" : color,
      hideBranding: isPro ? hideBranding : false,
    });
    setIsPending(false);
    if (result.error) toast.error(result.error);
    else toast.success("Branding saved.");
  }

  const hexValid = /^#[0-9a-fA-F]{6}$/.test(color);

  return (
    <div className="space-y-5">
      {/* Logo URL */}
      <div className="space-y-1.5">
        <Label htmlFor="brand-logo">Logo URL</Label>
        <Input
          id="brand-logo"
          type="url"
          placeholder="https://yourbrand.com/logo.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Paste a direct link to your logo image. Appears in the report header instead of the LinkPilot logo.
        </p>
        {logoUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-8 max-w-[160px] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
        )}
      </div>

      {/* Brand color */}
      <div className="space-y-1.5">
        <Label>Brand color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={hexValid ? color : "#0d9488"}
            onChange={handleColorPickerChange}
            disabled={isPending}
            className="h-9 w-12 cursor-pointer rounded-md border border-border bg-card p-1"
          />
          <Input
            ref={colorTextRef}
            value={color}
            onChange={handleColorTextChange}
            placeholder="#0d9488"
            maxLength={7}
            className="w-28 font-mono text-sm"
            disabled={isPending}
          />
          {hexValid && (
            <div
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Used for headings and accent elements in the report.
        </p>
      </div>

      {/* Hide branding (Pro only) */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Hide "Powered by LinkPilot"
            {!isPro && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Pro
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPro
              ? "Remove all LinkPilot branding from shared reports."
              : "Upgrade to Pro to fully remove LinkPilot branding."}
          </p>
        </div>
        <Switch
          checked={isPro ? hideBranding : false}
          onCheckedChange={isPro ? setHideBranding : undefined}
          disabled={!isPro || isPending}
        />
      </div>

      {/* Preview hint */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        Changes apply to all shared report links from this workspace.
        {!isPro && !hideBranding && (
          <span> Starter plan: a small "Powered by LinkPilot" note is shown at the bottom.</span>
        )}
      </div>

      <Button onClick={handleSave} disabled={isPending || !hexValid}>
        {isPending ? "Saving…" : "Save branding"}
      </Button>
    </div>
  );
}
