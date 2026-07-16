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
          <label className="text-xs text-zinc-500">Domain</label>
          <Input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. phishing-example.com"
            className="w-64 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Reason</label>
          <Input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Optional"
            className="w-64 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <Button type="submit" size="sm" className="gap-1.5" disabled={isCreating || !newDomain.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Block domain
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Blocked since</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {domains.map((d) => (
              <tr key={d.domain}>
                <td className="px-4 py-3 font-mono text-xs text-zinc-100">{d.domain}</td>
                <td className="px-4 py-3 text-zinc-400">{d.reason ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-500">{d.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-red-400">
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
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
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
