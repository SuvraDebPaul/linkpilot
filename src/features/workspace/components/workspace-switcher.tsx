"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { Check, ChevronsUpDown, Plus, Building2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canCreateWorkspace, PLAN_LIMITS, type PlanTier } from "@/lib/plans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createWorkspaceAction,
  setActiveWorkspaceAction,
} from "@/features/workspace/actions/workspace.actions";

type WorkspaceOption = { id: string; name: string; role: string };

const ICON_ACCENTS = [
  "bg-teal-500/10 text-teal-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
  "bg-sky-500/10 text-sky-600",
  "bg-rose-500/10 text-rose-600",
  "bg-emerald-500/10 text-emerald-600",
];

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  plan,
}: {
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string | null;
  plan: PlanTier;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const active = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
  const ownedCount = workspaces.filter((w) => w.role === "OWNER").length;
  const atLimit = !canCreateWorkspace(plan, ownedCount);

  function handleCreateSelect(e: Event) {
    e.preventDefault();
    if (atLimit) {
      toast.error(
        plan === "pro"
          ? `You've reached the ${PLAN_LIMITS.pro.workspaces}-workspace limit.`
          : "Upgrade to Pro to create additional workspaces.",
      );
      return;
    }
    setCreateOpen(true);
  }

  async function switchTo(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) return;
    const result = await setActiveWorkspaceAction(workspaceId);
    // setActiveWorkspaceAction redirects on success — an error result means it didn't
    if (result?.error) toast.error(result.error);
  }

  // Cmd/Ctrl+1-9 jumps straight to that workspace, from anywhere in the dashboard.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      const target = workspaces[n - 1];
      if (!target) return;
      e.preventDefault();
      switchTo(target.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, activeWorkspaceId]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const result = await createWorkspaceAction({ name });
    setIsPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    // createWorkspaceAction redirects on success
    setCreateOpen(false);
    setName("");
  }

  if (!active) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{active.name}</span>
              <span className="block truncate text-[11px] capitalize text-muted-foreground">{active.role.toLowerCase()}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((w, i) => {
            const isActive = w.id === active.id;
            const accent = ICON_ACCENTS[i % ICON_ACCENTS.length];
            return (
              <DropdownMenuItem key={w.id} onClick={() => switchTo(w.id)} className="gap-2 py-2">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accent}`}>
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate">{w.name}</span>
                {isActive ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  i < 9 && <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 py-2" onSelect={handleCreateSelect}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground">
              {atLimit ? <Lock className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </span>
            <span className="text-muted-foreground">
              {atLimit ? "Create workspace — upgrade to Pro" : "Create workspace"}
            </span>
          </DropdownMenuItem>
          {atLimit && plan !== "pro" && (
            <DropdownMenuItem asChild className="justify-center py-1.5 text-xs text-primary">
              <Link href="/dashboard/settings/billing">Upgrade plan</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Client Co."
                required
                disabled={isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
