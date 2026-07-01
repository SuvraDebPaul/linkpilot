"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { assignLinkToCampaignAction } from "@/features/campaigns/actions/campaign.actions";
import { Button } from "@/components/ui/button";

export function RemoveLinkFromCampaign({ linkId, campaignId }: { linkId: string; campaignId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleRemove() {
    setIsPending(true);
    const result = await assignLinkToCampaignAction(linkId, null);
    setIsPending(false);
    if (result.success) {
      toast.success("Link removed from campaign.");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
      onClick={handleRemove}
      disabled={isPending}
      title="Remove from campaign"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
