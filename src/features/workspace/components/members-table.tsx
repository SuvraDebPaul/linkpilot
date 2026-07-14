"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { MoreHorizontal, Crown, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getInitials } from "@/lib/initials";
import {
  changeMemberRoleAction,
  removeMemberAction,
  transferOwnershipAction,
} from "@/features/workspace/actions/workspace.actions";
import type { WorkspaceRole } from "@/generated/prisma/enums";

type Member = {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAsWorkspaceMember: boolean;
  };
};

const ROLE_STYLE: Record<WorkspaceRole, { badge: string; icon: typeof Crown }> = {
  OWNER: { badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", icon: Crown },
  ADMIN: { badge: "bg-primary/15 text-primary", icon: ShieldCheck },
  MEMBER: { badge: "bg-muted text-foreground", icon: UserIcon },
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

  function transferOwnership(memberId: string) {
    startTransition(async () => {
      const r = await transferOwnershipAction(memberId, workspaceId);
      if (r.error) toast.error(r.error);
      else toast.success("Ownership transferred. You are now an admin.");
    });
  }

  return (
    <div className="divide-y divide-border/50 rounded-lg border border-border">
      {members.map((m) => {
        const isMe = m.user.id === currentUserId;
        const isOwner = currentUserRole === "OWNER";
        const isAdmin = currentUserRole === "ADMIN";
        // Owners can change roles, transfer ownership, and remove; admins can only
        // remove — matches what changeMemberRoleAction/transferOwnershipAction vs.
        // removeMemberAction actually permit server-side.
        const canManage = (isOwner || isAdmin) && !isMe && m.role !== "OWNER";
        const rs = ROLE_STYLE[m.role];

        return (
          <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {m.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.user.image} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(m.user.name, m.user.email)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {m.user.name ?? m.user.email}
                  {isMe && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(You)</span>}
                </p>
                {m.user.name && <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${rs.badge}`}>
                <rs.icon className="h-3 w-3" />
                {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
              </span>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending} aria-label="Member actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner && (
                      <>
                        {m.role === "MEMBER" ? (
                          <DropdownMenuItem onClick={() => changeRole(m.id, "ADMIN")}>
                            <ShieldCheck className="h-3.5 w-3.5" /> Make admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => changeRole(m.id, "MEMBER")}>
                            <UserIcon className="h-3.5 w-3.5" /> Make member
                          </DropdownMenuItem>
                        )}
                        <ConfirmDialog
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Crown className="h-3.5 w-3.5" /> Transfer ownership
                            </DropdownMenuItem>
                          }
                          title={`Make ${m.user.name ?? m.user.email} the owner?`}
                          description="You will become an admin. This cannot be undone by yourself — only the new owner can transfer it back."
                          confirmLabel="Transfer ownership"
                          onConfirm={() => transferOwnership(m.id)}
                        />
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <ConfirmDialog
                      trigger={
                        <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                          Remove from workspace
                        </DropdownMenuItem>
                      }
                      title={`Remove ${m.user.name ?? m.user.email}?`}
                      description={
                        m.user.createdAsWorkspaceMember
                          ? "This account was created for this workspace only — removing them will permanently delete the account. This cannot be undone."
                          : "They will lose access to this workspace immediately."
                      }
                      confirmLabel="Remove"
                      onConfirm={() => remove(m.id)}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
