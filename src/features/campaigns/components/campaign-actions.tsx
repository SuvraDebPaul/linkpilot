"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCampaignAction, updateCampaignAction } from "@/features/campaigns/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type Campaign = { id: string; name: string; description: string | null };

export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    const result = await deleteCampaignAction(campaign.id);
    if (result.success) { toast.success(result.message); router.push("/dashboard/campaigns"); }
    else toast.error(result.message);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateCampaignAction(campaign.id, {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
    });
    setIsPending(false);
    if (result.success) { toast.success(result.message); setEditOpen(false); }
    else toast.error(result.message);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete campaign
              </DropdownMenuItem>
            }
            title={`Delete "${campaign.name}"?`}
            description="The campaign will be deleted. Your links will not be affected."
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" name="name" defaultValue={campaign.name} required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-desc">Description</Label>
              <Input id="e-desc" name="description" defaultValue={campaign.description ?? ""} disabled={isPending} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
