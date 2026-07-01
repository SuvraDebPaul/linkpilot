"use client";

import { useState } from "react";
import { Plus, X, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlanGateCard } from "@/components/shared/plan-gate-card";
import { COUNTRIES } from "@/constants/countries";
import { updateGeoTargetsAction, type GeoTarget } from "@/features/links/actions/geo-targets.actions";

interface Props {
  linkId: string;
  isPaidPlan: boolean;
  initialTargets: GeoTarget[];
}

export function GeoTargetsForm({ linkId, isPaidPlan, initialTargets }: Props) {
  const [targets, setTargets] = useState<GeoTarget[]>(initialTargets);
  const [country, setCountry] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      )
    : COUNTRIES;

  const usedCodes = new Set(targets.map((t) => t.country));

  function addRule() {
    if (!country || !url) return;
    if (usedCodes.has(country)) {
      toast.error("A rule for this country already exists");
      return;
    }
    try { new URL(url); } catch { toast.error("Enter a valid URL"); return; }
    setTargets((prev) => [...prev, { country, url }]);
    setCountry("");
    setUrl("");
    setSearch("");
  }

  function removeRule(code: string) {
    setTargets((prev) => prev.filter((t) => t.country !== code));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateGeoTargetsAction(linkId, targets);
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else toast.success("Geo rules saved");
  }

  if (!isPaidPlan) {
    return (
      <PlanGateCard
        icon={Globe}
        title="Geo targeting"
        description="Redirect visitors to different URLs based on their country."
        lockedTitle="Country-based redirects"
        lockedDescription="Send visitors to different destination URLs depending on where they're browsing from."
        requiredPlanLabel="Starter+"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" /> Geo targeting
        </CardTitle>
        <CardDescription>
          Redirect visitors to a different URL based on their country. Falls back to the main URL for
          countries without a rule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing rules */}
        {targets.length > 0 && (
          <div className="space-y-2">
            {targets.map((t) => {
              const info = COUNTRIES.find((c) => c.code === t.country);
              return (
                <div
                  key={t.country}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <span className="text-lg leading-none">{info?.flag ?? "🌐"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      {info?.name ?? t.country}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{t.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRule(t.country)}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add rule */}
        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add rule</p>

          <div className="space-y-1.5">
            <Label className="text-xs">Country</Label>
            <Input
              placeholder="Search country…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCountry(""); }}
              className="text-sm"
            />
            {search && (
              <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-card shadow-sm">
                {filtered.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No matches</p>
                ) : (
                  filtered.slice(0, 20).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      disabled={usedCodes.has(c.code)}
                      onClick={() => { setCountry(c.code); setSearch(`${c.flag} ${c.name}`); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>{c.flag}</span>
                      <span className="text-foreground">{c.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Destination URL</Label>
            <Input
              placeholder="https://example.com/en-us"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-sm"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={addRule}
            disabled={!country || !url}
          >
            <Plus className="h-3.5 w-3.5" /> Add rule
          </Button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Save geo rules
        </Button>
      </CardContent>
    </Card>
  );
}
