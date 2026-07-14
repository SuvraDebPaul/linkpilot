"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";
import { toast } from "@/lib/toast";

import {
  enableShareReportAction,
  disableShareReportAction,
} from "@/features/campaigns/actions/share-report.action";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { siteConfig } from "@/config/site";

export function ShareReportButton({
  campaignId,
  initialToken,
}: {
  campaignId: string;
  initialToken: string | null;
}) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(false);

  const shareUrl = token ? `${siteConfig.url}/report/${token}` : null;

  async function handleEnable() {
    setLoading(true);
    const result = await enableShareReportAction(campaignId);
    setLoading(false);
    if (result.success && result.token) {
      setToken(result.token);
      toast.success("Share link created.");
    } else {
      toast.error(result.message);
    }
  }

  async function handleDisable() {
    setLoading(true);
    const result = await disableShareReportAction(campaignId);
    setLoading(false);
    if (result.success) {
      setToken(null);
      toast.success("Share link revoked.");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {shareUrl ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[240px] truncate">{shareUrl}</span>
            <CopyButton value={shareUrl} size="icon" label="" copiedLabel="" variant="ghost" ariaLabel="Copy share link" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDisable} disabled={loading} title="Revoke share link">
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={handleEnable} disabled={loading} className="gap-1.5">
          <Link2 className="h-4 w-4" />
          {loading ? "Creating…" : "Share report"}
        </Button>
      )}
    </div>
  );
}
