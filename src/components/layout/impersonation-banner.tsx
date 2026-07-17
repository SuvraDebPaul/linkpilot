"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserCog } from "lucide-react";
import { toast } from "@/lib/toast";
import { endImpersonationAction } from "@/features/admin/actions/impersonation.actions";

// Rendered inside the regular dashboard shell (not the admin shell) since
// while impersonating, session.user.isSuperAdmin is forced false and the
// admin is viewing the app exactly as the target user would — this banner is
// the one persistent reminder, everywhere in the dashboard, that they aren't.
export function ImpersonationBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  if (!session?.user?.impersonatedBy) return null;

  async function handleEnd() {
    setIsPending(true);
    try {
      const result = await endImpersonationAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      await update({ endImpersonation: true });
      toast.success(result.message);
      router.push("/admin/users");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex h-9 shrink-0 items-center justify-center gap-2 bg-red-600 px-4 text-xs font-medium text-white">
      <UserCog className="h-3.5 w-3.5" />
      Viewing as {session.user.email} — impersonation is audit-logged
      <button
        onClick={handleEnd}
        disabled={isPending}
        className="ml-2 rounded bg-white/20 px-2 py-0.5 hover:bg-white/30 disabled:opacity-50"
      >
        {isPending ? "Ending…" : "Exit impersonation"}
      </button>
    </div>
  );
}
