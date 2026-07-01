"use client";

import { useState } from "react";
import { Plus, X, Loader2, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlanGateCard } from "@/components/shared/plan-gate-card";
import {
  updateRetargetingPixelsAction,
  type RetargetingPixel,
} from "@/features/links/actions/retargeting-pixels.actions";

const PIXEL_OPTIONS = [
  { type: "meta" as const,     label: "Meta (Facebook)",  placeholder: "1234567890123456",  hint: "Numeric pixel ID from Events Manager" },
  { type: "google" as const,   label: "Google Ads",       placeholder: "AW-123456789",       hint: "Conversion tracking ID from Google Ads" },
  { type: "tiktok" as const,   label: "TikTok",           placeholder: "C4ABCDEFGHIJ",       hint: "Pixel code from TikTok Ads Manager" },
  { type: "linkedin" as const, label: "LinkedIn",         placeholder: "1234567",            hint: "Partner ID from LinkedIn Campaign Manager" },
];

const TYPE_COLORS: Record<string, string> = {
  meta:     "bg-blue-100 text-blue-700",
  google:   "bg-red-100 text-red-700",
  tiktok:   "bg-slate-100 text-slate-700",
  linkedin: "bg-sky-100 text-sky-700",
};

interface Props {
  linkId: string;
  plan: "free" | "starter" | "pro";
  initialPixels: RetargetingPixel[];
}

export function RetargetingPixelsForm({ linkId, plan, initialPixels }: Props) {
  const maxPixels = plan === "pro" ? 4 : plan === "starter" ? 2 : 0;
  const [pixels, setPixels] = useState<RetargetingPixel[]>(initialPixels);
  const [type, setType] = useState<RetargetingPixel["type"]>("meta");
  const [id, setId] = useState("");
  const [saving, setSaving] = useState(false);

  const usedTypes = new Set(pixels.map((p) => p.type));
  const selectedOption = PIXEL_OPTIONS.find((o) => o.type === type)!;

  function addPixel() {
    if (!id.trim()) return;
    if (usedTypes.has(type)) { toast.error("That pixel type is already added"); return; }
    if (pixels.length >= maxPixels) { toast.error(`Limit reached for your plan`); return; }
    setPixels((prev) => [...prev, { type, id: id.trim() }]);
    setId("");
  }

  function removePixel(t: string) {
    setPixels((prev) => prev.filter((p) => p.type !== t));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateRetargetingPixelsAction(linkId, pixels);
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else toast.success("Pixels saved");
  }

  if (plan === "free") {
    return (
      <PlanGateCard
        icon={Crosshair}
        title="Retargeting pixels"
        description="Cookie every clicker for Meta, Google, TikTok & LinkedIn ads."
        lockedTitle="Fire pixels on every click"
        lockedDescription="Build retargeting audiences automatically — no code on the destination site needed."
        requiredPlanLabel="Starter+"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" /> Retargeting pixels
        </CardTitle>
        <CardDescription>
          Every click fires your pixel before the visitor lands on the destination. No JS on the destination site needed.
          {plan === "starter" && " Starter: 2 pixels per link. Upgrade to Pro for all 4."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active pixels */}
        {pixels.length > 0 && (
          <div className="space-y-2">
            {pixels.map((p) => {
              const opt = PIXEL_OPTIONS.find((o) => o.type === p.type)!;
              return (
                <div key={p.type} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[p.type]}`}>
                    {opt.label}
                  </span>
                  <span className="flex-1 truncate font-mono text-xs text-muted-foreground">{p.id}</span>
                  <button
                    type="button"
                    onClick={() => removePixel(p.type)}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add pixel */}
        {pixels.length < maxPixels && (
          <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add pixel</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Platform</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {PIXEL_OPTIONS.map((o) => (
                  <button
                    key={o.type}
                    type="button"
                    disabled={usedTypes.has(o.type)}
                    onClick={() => setType(o.type)}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      type === o.type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pixel / Tracking ID</Label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={selectedOption.placeholder}
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && addPixel()}
              />
              <p className="text-xs text-muted-foreground">{selectedOption.hint}</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={addPixel}
              disabled={!id.trim()}
            >
              <Plus className="h-3.5 w-3.5" /> Add pixel
            </Button>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Save pixels
        </Button>
      </CardContent>
    </Card>
  );
}
