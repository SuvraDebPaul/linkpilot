"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/lib/toast";

import { assignLinkToCampaignAction } from "@/features/campaigns/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function RemoveLinkFromCampaign({ linkId }: { linkId: string }) {
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
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          disabled={isPending}
          title="Remove from campaign"
          aria-label="Remove from campaign"
        >
          <X className="h-4 w-4" />
        </Button>
      }
      title="Remove link from campaign?"
      description="The link itself won't be deleted — you can add it back to this or any other campaign later."
      confirmLabel="Remove"
      onConfirm={handleRemove}
    />
  );
}
