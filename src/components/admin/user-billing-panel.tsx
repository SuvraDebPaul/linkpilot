"use client";

import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { TypedConfirmDialog } from "@/components/shared/typed-confirm-dialog";
import { cancelSubscriptionAction, refundLatestChargeAction } from "@/features/admin/actions/admin-billing.actions";

export function UserBillingPanel({
  userId,
  hasSubscription,
  hasStripeCustomer,
}: {
  userId: string;
  hasSubscription: boolean;
  hasStripeCustomer: boolean;
}) {
  const router = useRouter();

  if (!hasSubscription && !hasStripeCustomer) return null;

  async function handleCancel() {
    const result = await cancelSubscriptionAction(userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleRefund() {
    const result = await refundLatestChargeAction(userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CreditCard className="h-4 w-4" />
        Billing
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {hasSubscription && (
          <TypedConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                Cancel subscription
              </Button>
            }
            title="Cancel this user's Stripe subscription?"
            description="This cancels it immediately in Stripe and downgrades the account to Free. This cannot be undone from here."
            confirmText="CANCEL"
            confirmLabel="Cancel subscription"
            onConfirm={handleCancel}
          />
        )}
        {hasStripeCustomer && (
          <TypedConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                Refund latest charge
              </Button>
            }
            title="Refund this customer's most recent charge?"
            description="This issues a real refund through Stripe for the most recent charge on file. This cannot be undone."
            confirmText="REFUND"
            confirmLabel="Refund"
            onConfirm={handleRefund}
          />
        )}
      </div>
    </div>
  );
}
