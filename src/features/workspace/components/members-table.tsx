"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { changeMemberRoleAction, removeMemberAction } from "@/features/workspace/actions/workspace.actions";
import type { WorkspaceRole } from "@/generated/prisma/enums";

type Member = {
  id: string;
  role: WorkspaceRole;
  user: { id: string; name: string | null; email: string | null; image: string | null };
};

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  OWNER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-primary/15 text-primary",
  MEMBER: "bg-muted text-foreground",
};

export function MembersTable({
  members,
  workspaceId,
  currentUserId,
  currentUserRole,
}: {
  members: Member[];
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}) {
  const [isPending, startTransition] = useTransition();

  function changeRole(memberId: string, role: "ADMIN" | "MEMBER") {
    startTransition(async () => {
      const r = await changeMemberRoleAction(memberId, workspaceId, role);
      if (r.error) toast.error(r.error);
      else toast.success("Role updated.");
    });
  }

  function remove(memberId: string) {
    startTransition(async () => {
      const r = await removeMemberAction(memberId, workspaceId);
      if (r.error) toast.error(r.error);
      else toast.success("Member removed.");
    });
  }

  return (
    <div className="divide-y divide-border/50 rounded-lg border border-border">
      {members.map((m) => {
        const isMe = m.user.id === currentUserId;
        const canManage = currentUserRole === "OWNER" && !isMe && m.role !== "OWNER";
        return (
          <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              {m.user.image ? (
                <img src={m.user.image} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {(m.user.name ?? m.user.email ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{m.user.name ?? m.user.email}</p>
                {m.user.name && <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[m.role]}`}>
                {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
              </span>
              {canManage && (
                <>
                  {m.role === "MEMBER" ? (
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeRole(m.id, "ADMIN")}>
                      Make admin
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeRole(m.id, "MEMBER")}>
                      Make member
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => remove(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
              {isMe && m.role !== "OWNER" && (
                <span className="text-xs text-muted-foreground">You</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
