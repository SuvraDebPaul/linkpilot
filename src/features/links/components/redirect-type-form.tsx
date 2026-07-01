"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateRedirectTypeAction } from "@/features/links/actions/redirect-type.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanTier } from "@/lib/plans";

const REDIRECT_OPTIONS = [
  {
    value: "302" as const,
    label: "302 — Temporary",
    description: "Default. Browser does not cache; each visit re-checks the redirect.",
  },
  {
    value: "301" as const,
    label: "301 — Permanent",
    description: "Browser and search engines cache the redirect permanently. Best for SEO when the destination never changes.",
  },
  {
    value: "307" as const,
    label: "307 — Temporary (strict)",
    description: "Like 302 but strictly preserves the HTTP method (POST stays POST).",
  },
];

type Props = {
  linkId: string;
  plan: PlanTier;
  initialType: string;
};

export function RedirectTypeForm({ linkId, plan, initialType }: Props) {
  const isPaidPlan = plan === "starter" || plan === "pro";
  const [selected, setSelected] = useState<"301" | "302" | "307">(
    (["301", "302", "307"].includes(initialType) ? initialType : "302") as "301" | "302" | "307",
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSave() {
    setIsPending(true);
    const result = await updateRedirectTypeAction(linkId, selected);
    setIsPending(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">HTTP Status</CardTitle>
          {!isPaidPlan && (
            <Badge variant="secondary" className="text-xs">Starter+</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isPaidPlan ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">Custom redirect type</p>
            <p className="text-xs text-muted-foreground">
              Choose between 301 permanent, 302 temporary, and 307 strict redirects.
              Available on Starter and Pro.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/settings/billing">Upgrade</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {REDIRECT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                  selected === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="redirectType"
                  value={opt.value}
                  checked={selected === opt.value}
                  onChange={() => setSelected(opt.value)}
                  className="mt-0.5 accent-primary"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </label>
            ))}

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full"
              size="sm"
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
