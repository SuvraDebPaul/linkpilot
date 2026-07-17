"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut, Mail, Ban, Trash2, ShieldAlert, UserCog } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TypedConfirmDialog } from "@/components/shared/typed-confirm-dialog";
import {
  forceLogoutUserAction,
  sendPasswordResetUserAction,
  grantPlanAction,
  suspendUserAction,
  deleteUserAction,
} from "@/features/admin/actions/admin-users.actions";
import { impersonateUserAction } from "@/features/admin/actions/impersonation.actions";

type Plan = "free" | "starter" | "pro" | "lifetime";

export function UserActionsPanel({
  userId,
  email,
  isSuperAdmin,
  suspended,
  currentPlan,
}: {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  suspended: boolean;
  currentPlan: Plan;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [plan, setPlan] = useState<Plan>(currentPlan);
  const [isImpersonating, setIsImpersonating] = useState(false);

  if (isSuperAdmin) {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <ShieldAlert className="h-4 w-4" />
        This account is a super-admin — actions are disabled here to prevent one admin from acting on another.
      </div>
    );
  }

  function handlePlanChange(next: Plan) {
    setPlan(next);
    startTransition(async () => {
      const result = await grantPlanAction(userId, next);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
        setPlan(currentPlan);
      }
    });
  }

  async function handleForceLogout() {
    const result = await forceLogoutUserAction(userId);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleSendReset() {
    const result = await sendPasswordResetUserAction(userId);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleToggleSuspend() {
    const result = await suspendUserAction(userId, !suspended);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleImpersonate() {
    setIsImpersonating(true);
    try {
      const result = await impersonateUserAction(userId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      // Re-signs the JWT cookie in place (see auth.ts's jwt callback,
      // trigger === "update") — this is the actual identity switch;
      // impersonateUserAction above only checked permission and audit-logged it.
      await update({ impersonateUserId: userId });
      toast.success(result.message);
      router.push("/dashboard");
    } finally {
      setIsImpersonating(false);
    }
  }

  async function handleDelete() {
    const result = await deleteUserAction(userId);
    if (result.success) {
      toast.success(result.message);
      router.push("/admin/users");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Admin actions</h2>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Plan</span>
        <Select value={plan} disabled={isPending} onValueChange={(v) => handlePlanChange(v as Plan)}>
          <SelectTrigger className="w-40 border-border bg-background text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Manual override — bypasses Stripe</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConfirmDialog
          trigger={
            <Button size="sm" className="gap-1.5" disabled={isImpersonating}>
              <UserCog className="h-3.5 w-3.5" />
              Impersonate
            </Button>
          }
          title="Impersonate this user?"
          description="You'll be signed in as this user on your next page load. This is heavily audit-logged, and you can end it anytime from the banner shown while impersonating."
          confirmLabel="Start impersonating"
          variant="default"
          onConfirm={handleImpersonate}
        />
        <Button variant="outline" size="sm" onClick={handleForceLogout} className="gap-1.5 text-foreground">
          <LogOut className="h-3.5 w-3.5" />
          Force logout
        </Button>
        <Button variant="outline" size="sm" onClick={handleSendReset} className="gap-1.5 text-foreground">
          <Mail className="h-3.5 w-3.5" />
          Send password reset
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5 text-foreground">
              <Ban className="h-3.5 w-3.5" />
              {suspended ? "Unsuspend" : "Suspend"}
            </Button>
          }
          title={suspended ? "Unsuspend this user?" : "Suspend this user?"}
          description={
            suspended
              ? "They'll immediately regain access to their account."
              : "They'll be signed out and blocked from signing back in until unsuspended."
          }
          confirmLabel={suspended ? "Unsuspend" : "Suspend"}
          variant={suspended ? "default" : "destructive"}
          onConfirm={handleToggleSuspend}
        />
        <TypedConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete account
            </Button>
          }
          title="Delete this user permanently?"
          description="This deletes the account and all of its links, campaigns, and domains. This cannot be undone."
          confirmText={email}
          confirmLabel="Delete permanently"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
