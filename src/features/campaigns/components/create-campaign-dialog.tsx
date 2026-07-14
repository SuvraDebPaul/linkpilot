"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { createCampaignAction } from "@/features/campaigns/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CreateCampaignDialog({ trigger }: { trigger?: ReactNode } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await createCampaignAction({
      name: fd.get("name"),
      description: fd.get("description"),
    });
    setIsPending(false);
    if (!result.success) { toast.error(result.message); return; }
    toast.success(result.message);
    setOpen(false);
    if (result.data?.id) router.push(`/dashboard/campaigns/${result.data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="gap-2"><Plus className="h-4 w-4" /> New campaign</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create campaign</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Campaign name <span className="text-destructive">*</span></Label>
            <Input id="c-name" name="name" placeholder="e.g. Summer 2025" required disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-desc">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="c-desc" name="description" placeholder="What is this campaign for?" disabled={isPending} />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
