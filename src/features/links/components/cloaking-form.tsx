"use client";

import { useState } from "react";
import { Loader2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateCloakingAction } from "@/features/links/actions/cloaking.actions";

interface Props {
  linkId: string;
  plan: "free" | "starter" | "pro";
  initialCloaked: boolean;
  initialHideReferrer: boolean;
}

export function CloakingForm({ linkId, plan, initialCloaked, initialHideReferrer }: Props) {
  const [isCloaked, setIsCloaked] = useState(initialCloaked);
  const [hideReferrer, setHideReferrer] = useState(initialHideReferrer);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateCloakingAction(linkId, { isCloaked, hideReferrer });
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else toast.success("Saved");
  }

  if (plan === "free") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <EyeOff className="h-4 w-4" /> Link cloaking
          </CardTitle>
          <CardDescription>Hide your destination URL and referrer from visitors and analytics tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Cloaking and referrer hiding are available on{" "}
              <a href="/dashboard/settings/billing" className="font-semibold text-foreground underline underline-offset-2">
                Starter & Pro plans
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <EyeOff className="h-4 w-4" /> Link cloaking
        </CardTitle>
        <CardDescription>
          Control what visitors and third-party tools see when someone clicks your link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cloak URL */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
          <div>
            <Label className="text-sm font-medium">Cloak destination URL</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Visitors see your short link in the address bar while the destination loads inside a full-screen frame. Destination site is hidden.
            </p>
            {isCloaked && (
              <p className="mt-1.5 text-xs text-amber-600">
                Note: Sites with X-Frame-Options or CSP frame restrictions cannot be cloaked.
              </p>
            )}
          </div>
          <Switch
            checked={isCloaked}
            onCheckedChange={setIsCloaked}
            className="mt-0.5 shrink-0"
          />
        </div>

        {/* Hide referrer */}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
          <div>
            <Label className="text-sm font-medium">Hide referrer</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The destination site won't see which page the visitor came from. Useful when you don't want to reveal your traffic sources.
            </p>
          </div>
          <Switch
            checked={hideReferrer}
            onCheckedChange={setHideReferrer}
            className="mt-0.5 shrink-0"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
