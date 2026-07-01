"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { createClientAccessAction } from "@/features/clients/actions/client-access.actions";

type Campaign = { id: string; name: string };

interface Props {
  workspaceId: string;
  campaigns: Campaign[];
}

export function CreateClientDialog({ workspaceId, campaigns }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendInvite, setSendInvite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName(""); setEmail(""); setSelectedIds(new Set()); setSendInvite(true); setError("");
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createClientAccessAction({
      workspaceId,
      clientName: name.trim() || undefined,
      clientEmail: email.trim(),
      campaignIds: Array.from(selectedIds),
      sendInvite,
    });
    setLoading(false);
    if ("error" in result) { setError(result.error); return; }
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create client portal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="cca-name">Client name (optional)</Label>
            <Input
              id="cca-name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cca-email">Client email <span className="text-destructive">*</span></Label>
            <Input
              id="cca-email"
              type="email"
              placeholder="client@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Campaigns to share <span className="text-destructive">*</span></Label>
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaigns yet. Create one first.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border border-border p-3">
                {campaigns.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={() => toggle(c.id)}
                    />
                    <span className="text-sm text-foreground">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Send invite email</p>
              <p className="text-xs text-muted-foreground">Email the portal link to the client</p>
            </div>
            <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedIds.size === 0}>
              {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create portal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
