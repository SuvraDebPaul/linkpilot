"use client";

import { useState } from "react";
import { Plus, X, Globe, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { COUNTRIES } from "@/constants/countries";
import {
  createGeoTemplateAction,
  deleteGeoTemplateAction,
} from "@/features/templates/actions/templates.actions";

type GeoTarget = { country: string; url: string };
type GeoTemplate = { id: string; name: string; targets: unknown; createdAt: Date };

export function GeoTemplatesPanel({
  workspaceId,
  initialTemplates,
}: {
  workspaceId: string;
  initialTemplates: GeoTemplate[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [name, setName] = useState("");
  const [targets, setTargets] = useState<GeoTarget[]>([]);
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
    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    setTargets((prev) => [...prev, { country, url }]);
    setCountry("");
    setUrl("");
    setSearch("");
  }

  function removeRule(code: string) {
    setTargets((prev) => prev.filter((t) => t.country !== code));
  }

  async function handleCreate() {
    if (!name.trim() || targets.length === 0) return;
    setSaving(true);
    const result = await createGeoTemplateAction({ workspaceId, name, targets });
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setName("");
    setTargets([]);
    // Optimistic add — page will revalidate on next navigation
    setTemplates((prev) => [
      { id: `temp-${Date.now()}`, name, targets, createdAt: new Date() },
      ...prev,
    ]);
  }

  async function handleDelete(id: string) {
    const result = await deleteGeoTemplateAction(id);
    if (result.success) {
      toast.success(result.message);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" /> Create template
          </CardTitle>
          <CardDescription>
            Save a reusable set of country → destination-URL rules to apply when creating links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Template name</Label>
            <Input
              placeholder="e.g. English-speaking markets"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
                      <p className="text-xs font-semibold text-foreground">{info?.name ?? t.country}</p>
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

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add country rule</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Country</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search country…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCountry("");
                    }}
                    className="pl-8 text-sm"
                  />
                </div>
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
                          onClick={() => {
                            setCountry(c.code);
                            setSearch(`${c.flag} ${c.name}`);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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

          <Button onClick={handleCreate} disabled={saving || !name.trim() || targets.length === 0} className="w-full">
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save template
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Saved templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <EmptyState icon={Globe} title="You don't have any templates yet" />
          ) : (
            <div className="divide-y divide-border">
              {templates.map((t) => {
                const rules = Array.isArray(t.targets) ? (t.targets as GeoTarget[]) : [];
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rules.length} countr{rules.length !== 1 ? "ies" : "y"}
                      </p>
                    </div>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title={`Delete "${t.name}"?`}
                      description="This cannot be undone."
                      confirmLabel="Delete"
                      onConfirm={() => handleDelete(t.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
