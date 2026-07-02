"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { assignLinkToCampaignAction } from "@/features/campaigns/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkOption = { id: string; title: string | null; shortCode: string };

export function AddLinkToCampaign({
  campaignId,
  userId,
}: {
  campaignId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinkOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/links/available?campaignId=${campaignId}`)
      .then((r) => r.json())
      .then((data) => setLinks(data.links ?? []))
      .catch(() => setLinks([]));
  }, [open, campaignId]);

  async function handleAdd() {
    if (!selected) return;
    setIsPending(true);
    const result = await assignLinkToCampaignAction(selected, campaignId);
    setIsPending(false);
    if (result.success) {
      toast.success("Link added to campaign.");
      setOpen(false);
      setSelected("");
    } else toast.error(result.message);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add link to campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Choose a link</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a link…" />
              </SelectTrigger>
              <SelectContent>
                {links.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No available links
                  </SelectItem>
                ) : (
                  links.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title || l.shortCode}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only links not already in a campaign are shown.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selected || isPending}>
              {isPending ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
