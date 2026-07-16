"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { upsertSiteSettingAction } from "@/features/admin/actions/site-settings.actions";

export function SiteSettingsPanel({
  bannerEnabled,
  bannerMessage,
  supportEmail,
}: {
  bannerEnabled: boolean;
  bannerMessage: string;
  supportEmail: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(bannerEnabled);
  const [message, setMessage] = useState(bannerMessage);
  const [email, setEmail] = useState(supportEmail);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  async function handleSaveBanner() {
    setIsSavingBanner(true);
    try {
      const result = await upsertSiteSettingAction(
        "announcementBanner",
        JSON.stringify({ enabled, message }),
      );
      if (result.success) {
        toast.success("Banner settings saved.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSavingBanner(false);
    }
  }

  async function handleSaveEmail() {
    setIsSavingEmail(true);
    try {
      const result = await upsertSiteSettingAction("supportEmail", email.trim());
      if (result.success) {
        toast.success("Support email saved.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSavingEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Announcement Banner</h2>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <p className="mt-1 text-xs text-zinc-500">Shown at the top of the public site and dashboard.</p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Scheduled maintenance this Sunday, 2–3am UTC."
          className="mt-3 border-white/10 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
          rows={2}
        />
        <Button size="sm" className="mt-3" onClick={handleSaveBanner} disabled={isSavingBanner}>
          Save banner
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Support Email</h2>
        <p className="mt-1 text-xs text-zinc-500">Shown in the public site footer instead of the default.</p>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@linkpilot.app"
          className="mt-3 w-72 border-white/10 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
        />
        <Button size="sm" className="mt-3" onClick={handleSaveEmail} disabled={isSavingEmail}>
          Save email
        </Button>
      </div>
    </div>
  );
}
