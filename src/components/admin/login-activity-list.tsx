"use client";

import { useRouter } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { revokeLoginEventAction } from "@/features/admin/actions/admin-users.actions";

type LoginEvent = {
  id: string;
  type: string;
  ip: string | null;
  browser: string | null;
  createdAt: Date;
  revoked: boolean;
};

export function LoginActivityList({ userId, events }: { userId: string; events: LoginEvent[] }) {
  const router = useRouter();

  async function handleRevoke(loginEventId: string) {
    const result = await revokeLoginEventAction(loginEventId, userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  if (events.length === 0) {
    return <p className="mt-2 text-sm text-zinc-500">No login events recorded.</p>;
  }

  return (
    <ul className="mt-2 space-y-1.5 text-sm">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between text-zinc-400">
          <span className={e.revoked ? "line-through opacity-50" : ""}>
            {e.type} · {e.browser} · {e.ip}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">{e.createdAt.toLocaleString()}</span>
            {e.revoked ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                Revoked
              </span>
            ) : (
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="icon-xs" className="text-zinc-500 hover:text-red-400">
                    <ShieldOff className="h-3.5 w-3.5" />
                  </Button>
                }
                title="Revoke this session?"
                description="Signs out only this one device/session — other active sessions for this user are unaffected."
                confirmLabel="Revoke"
                onConfirm={() => handleRevoke(e.id)}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
