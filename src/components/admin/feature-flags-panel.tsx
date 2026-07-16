"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createFeatureFlagAction,
  toggleFeatureFlagAction,
  deleteFeatureFlagAction,
} from "@/features/admin/actions/feature-flags.actions";

type Flag = { key: string; enabled: boolean; description: string | null };

export function FeatureFlagsPanel({ flags }: { flags: Flag[] }) {
  const router = useRouter();
  const [newKey, setNewKey] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleToggle(key: string, enabled: boolean) {
    const result = await toggleFeatureFlagAction(key, enabled);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDelete(key: string) {
    const result = await deleteFeatureFlagAction(key);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim()) return;
    setIsCreating(true);
    try {
      const result = await createFeatureFlagAction(newKey, newDescription);
      if (result.success) {
        toast.success(result.message);
        setNewKey("");
        setNewDescription("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Enabled</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {flags.map((flag) => (
              <tr key={flag.key}>
                <td className="px-4 py-3 font-mono text-xs text-zinc-100">{flag.key}</td>
                <td className="px-4 py-3 text-zinc-400">{flag.description ?? "—"}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title={`Delete flag "${flag.key}"?`}
                    description="Any code checking this flag will fall back to its own default value."
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(flag.key)}
                  />
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No flags yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="mt-4 flex items-end gap-2">
        <div>
          <label className="text-xs text-zinc-500">Key</label>
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g. maintenanceMode"
            className="w-56 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Description</label>
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Optional"
            className="w-64 border-white/10 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <Button type="submit" size="sm" className="gap-1.5" disabled={isCreating || !newKey.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Add flag
        </Button>
      </form>
    </div>
  );
}
