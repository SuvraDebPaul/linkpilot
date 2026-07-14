"use client";

import { useState } from "react";
import { Plus, X, Loader2, FlaskConical, RotateCcw } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlanGateCard } from "@/components/shared/plan-gate-card";
import { updateAbVariantsAction, type AbVariant } from "@/features/links/actions/ab-variants.actions";

const LABELS = ["A", "B", "C", "D", "E"];

interface Props {
  linkId: string;
  plan: "free" | "starter" | "pro";
  originalUrl: string;
  initialVariants: AbVariant[];
}

export function AbVariantsForm({ linkId, plan, originalUrl, initialVariants }: Props) {
  const maxVariants = plan === "pro" ? 5 : plan === "starter" ? 2 : 0;

  const [variants, setVariants] = useState<AbVariant[]>(
    initialVariants.length
      ? initialVariants
      : [
          { url: originalUrl, weight: 50 },
          { url: "", weight: 50 },
        ],
  );
  const [saving, setSaving] = useState(false);

  const total = variants.reduce((s, v) => s + (Number(v.weight) || 0), 0);
  const totalOk = Math.round(total) === 100;

  function updateUrl(i: number, url: string) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, url } : v)));
  }

  function updateWeight(i: number, raw: string) {
    const weight = Math.max(1, Math.min(99, Number(raw) || 1));
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, weight } : v)));
  }

  function addVariant() {
    if (variants.length >= maxVariants) return;
    setVariants((prev) => [...prev, { url: "", weight: 0 }]);
  }

  function removeVariant(i: number) {
    if (variants.length <= 2) return;
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function autoBalance() {
    const each = Math.floor(100 / variants.length);
    const remainder = 100 - each * variants.length;
    setVariants((prev) =>
      prev.map((v, i) => ({ ...v, weight: each + (i === 0 ? remainder : 0) })),
    );
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateAbVariantsAction(linkId, variants);
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else toast.success("A/B test saved");
  }

  async function handleDisable() {
    setSaving(true);
    const result = await updateAbVariantsAction(linkId, []);
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else {
      toast.success("A/B test disabled");
      setVariants([
        { url: originalUrl, weight: 50 },
        { url: "", weight: 50 },
      ]);
    }
  }

  if (plan === "free") {
    return (
      <PlanGateCard
        icon={FlaskConical}
        title="A/B split testing"
        description="Split traffic between two or more destination URLs."
        lockedTitle="Weighted traffic splitting"
        lockedDescription="Test multiple landing pages against each other and let the data pick the winner."
        requiredPlanLabel="Starter+"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" /> A/B split testing
        </CardTitle>
        <CardDescription>
          Traffic is split randomly by weight. Geo rules take priority — A/B applies to unmatched countries.
          {plan === "starter" && " Starter supports 2 variants; upgrade to Pro for up to 5."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variant rows */}
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {LABELS[i]}
              </span>
              <div className="flex-1 space-y-1">
                <Input
                  value={v.url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder="https://example.com/landing"
                  className="text-sm"
                />
              </div>
              <div className="flex w-20 shrink-0 items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={v.weight}
                  onChange={(e) => updateWeight(i, e.target.value)}
                  className="text-sm text-center"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                disabled={variants.length <= 2}
                className="mt-2.5 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Weight total */}
        <div className="flex items-center justify-between text-xs">
          <span className={totalOk ? "text-green-600 font-medium" : "text-destructive font-medium"}>
            Total: {total}% {totalOk ? "✓" : "— must equal 100"}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={autoBalance} className="h-7 gap-1 text-xs">
            <RotateCcw className="h-3 w-3" /> Auto-balance
          </Button>
        </div>

        {/* Add variant */}
        {variants.length < maxVariants && (
          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" onClick={addVariant}>
            <Plus className="h-3.5 w-3.5" /> Add variant {LABELS[variants.length]}
          </Button>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !totalOk} className="flex-1">
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save test
          </Button>
          {initialVariants.length > 0 && (
            <Button variant="outline" onClick={handleDisable} disabled={saving}>
              Disable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
