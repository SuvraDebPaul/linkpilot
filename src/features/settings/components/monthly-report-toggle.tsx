"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { Switch } from "@/components/ui/switch";
import { updateMonthlyReportAction } from "@/features/settings/actions/settings.actions";

export function MonthlyReportToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    setEnabled(next);
    setSaving(true);
    const result = await updateMonthlyReportAction(next);
    setSaving(false);
    if (!result.success) {
      setEnabled(!next);
      toast.error(result.message);
    }
  }

  return <Switch checked={enabled} onCheckedChange={handleChange} disabled={saving} />;
}
