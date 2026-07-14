"use client";

import { useState } from "react";
import { Mail, Plus, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateReportEmailScheduleAction } from "@/features/campaigns/actions/campaign.actions";

type Props = {
  campaignId: string;
  hasShareToken: boolean;
  initialEnabled: boolean;
  initialFrequency: string;
  initialRecipients: string[];
};

export function ReportEmailForm({
  campaignId,
  hasShareToken,
  initialEnabled,
  initialFrequency,
  initialRecipients,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequency, setFrequency] = useState<"weekly" | "monthly">(
    (initialFrequency as "weekly" | "monthly") || "weekly",
  );
  const [recipients, setRecipients] = useState<string[]>(initialRecipients);
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);

  function addRecipient() {
    const email = draft.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (recipients.includes(email)) {
      toast.error("Already added.");
      return;
    }
    setRecipients((p) => [...p, email]);
    setDraft("");
  }

  function removeRecipient(email: string) {
    setRecipients((p) => p.filter((e) => e !== email));
  }

  async function handleSave() {
    setIsPending(true);
    const result = await updateReportEmailScheduleAction(campaignId, {
      enabled,
      frequency,
      recipients,
    });
    setIsPending(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  if (!hasShareToken) {
    return (
      <p className="text-sm text-muted-foreground">
        Enable report sharing on this campaign first — the schedule sends recipients the shareable report link.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Send scheduled reports</p>
          <p className="text-xs text-muted-foreground">Automatically email a campaign summary to clients.</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
      </div>

      {enabled && (
        <>
          {/* Frequency */}
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {(["weekly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    frequency === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {f === "weekly" ? "Weekly (Mondays)" : "Monthly (1st)"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {frequency === "weekly"
                ? "Sends every Monday morning with the past 7 days of data."
                : "Sends on the 1st of each month with the past 30 days of data."}
            </p>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="client@example.com"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecipient(); } }}
                disabled={isPending}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addRecipient} disabled={isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {recipients.length > 0 && (
              <ul className="space-y-1.5">
                {recipients.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {email}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {recipients.length === 0 && (
              <p className="text-xs text-muted-foreground">No recipients added yet.</p>
            )}
          </div>
        </>
      )}

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save schedule"}
      </Button>
    </div>
  );
}
