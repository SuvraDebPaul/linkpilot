"use client";

import { useState } from "react";
import { Megaphone, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createCampaignTemplateAction,
  deleteCampaignTemplateAction,
} from "@/features/templates/actions/templates.actions";

type CampaignTemplate = {
  id: string;
  name: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
};

const FIELDS: { key: keyof Omit<CampaignTemplate, "id" | "name">; label: string; hint: string }[] = [
  { key: "source", label: "Source", hint: "E.g. twitter, facebook" },
  { key: "medium", label: "Medium", hint: "E.g. banner, email" },
  { key: "campaign", label: "Campaign", hint: "E.g. acme_campaign" },
  { key: "term", label: "Campaign term", hint: "Identify the paid keywords" },
  { key: "content", label: "Campaign content", hint: "Use to differentiate ads" },
];

export function CampaignTemplatesPanel({
  workspaceId,
  initialTemplates,
}: {
  workspaceId: string;
  initialTemplates: CampaignTemplate[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const result = await createCampaignTemplateAction({ workspaceId, name, ...fields });
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setTemplates((prev) => [
      {
        id: `temp-${Date.now()}`,
        name,
        source: fields.source || null,
        medium: fields.medium || null,
        campaign: fields.campaign || null,
        term: fields.term || null,
        content: fields.content || null,
      },
      ...prev,
    ]);
    setName("");
    setFields({});
  }

  async function handleDelete(id: string) {
    const result = await deleteCampaignTemplateAction(id);
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
            <Megaphone className="h-4 w-4 text-primary" /> Create a template
          </CardTitle>
          <CardDescription>
            Save a reusable set of UTM parameters. Append them to any short URL to build a tagged link for a
            channel — LinkPilot already tracks utm_* parameters on every click.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Template name</Label>
            <Input
              placeholder="Generated campaign template"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  placeholder={f.hint}
                  value={fields[f.key] ?? ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="text-sm"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleCreate} disabled={saving || !name.trim()} className="w-full sm:w-auto">
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
            <EmptyState icon={Megaphone} title="You don't have any templates yet" />
          ) : (
            <div className="divide-y divide-border">
              {templates.map((t) => {
                const tags = [t.source, t.medium, t.campaign, t.term, t.content].filter(Boolean);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tags.length > 0 ? tags.join(" · ") : "No UTM parameters set"}
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
