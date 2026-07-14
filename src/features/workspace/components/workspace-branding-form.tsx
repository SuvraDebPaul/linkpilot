"use client";

import { useState, useRef } from "react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/shared/image-uploader";
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
      {/* Logo */}
      <div className="space-y-1.5">
        <Label>Logo</Label>
        <ImageUploader
          value={logoUrl}
          onChange={setLogoUrl}
          folder="branding-logos"
          shape="square"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Appears in the report header instead of the LinkPilot logo.
        </p>
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
            Hide &quot;Powered by LinkPilot&quot;
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
          <span> Starter plan: a small &quot;Powered by LinkPilot&quot; note is shown at the bottom.</span>
        )}
      </div>

      <Button onClick={handleSave} disabled={isPending || !hexValid}>
        {isPending ? "Saving…" : "Save branding"}
      </Button>
    </div>
  );
}
