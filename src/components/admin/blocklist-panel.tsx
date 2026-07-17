"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { addBlockedDomainAction, removeBlockedDomainAction } from "@/features/admin/actions/moderation.actions";

type BlockedDomain = { domain: string; reason: string | null; createdAt: Date };

export function BlocklistPanel({ domains }: { domains: BlockedDomain[] }) {
  const router = useRouter();
  const [newDomain, setNewDomain] = useState("");
  const [newReason, setNewReason] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsCreating(true);
    try {
      const result = await addBlockedDomainAction(newDomain, newReason);
      if (result.success) {
        toast.success(result.message);
        setNewDomain("");
        setNewReason("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRemove(domain: string) {
    const result = await removeBlockedDomainAction(domain);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Domain</label>
          <Input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. phishing-example.com"
            className="w-64 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Reason</label>
          <Input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Optional"
            className="w-64 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button type="submit" size="sm" className="gap-1.5" disabled={isCreating || !newDomain.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Block domain
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Blocked since</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {domains.map((d) => (
              <tr key={d.domain}>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{d.domain}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.reason ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title={`Unblock ${d.domain}?`}
                    description="New links to this domain will be allowed again."
                    confirmLabel="Unblock"
                    variant="default"
                    onConfirm={() => handleRemove(d.domain)}
                  />
                </td>
              </tr>
            ))}
            {domains.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No domains blocked.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
