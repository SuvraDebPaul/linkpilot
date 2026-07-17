"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { toggleLinkActiveAction } from "@/features/admin/actions/moderation.actions";

export function LinkActiveToggle({ linkId, isActive }: { linkId: string; isActive: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    const result = await toggleLinkActiveAction(linkId, !isActive);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="xs" className="text-foreground">
          {isActive ? "Disable" : "Enable"}
        </Button>
      }
      title={isActive ? "Disable this link?" : "Enable this link?"}
      description={
        isActive
          ? "Visitors will see an unavailable page instead of being redirected."
          : "The link will start redirecting visitors again."
      }
      confirmLabel={isActive ? "Disable" : "Enable"}
      variant={isActive ? "destructive" : "default"}
      onConfirm={handleToggle}
    />
  );
}
