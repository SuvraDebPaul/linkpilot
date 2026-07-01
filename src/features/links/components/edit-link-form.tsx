"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, FolderKanban, Zap } from "lucide-react";

import { updateLinkAction } from "@/features/links/actions/link.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkData = {
  id: string;
  title: string | null;
  isActive: boolean;
  isPasswordProtected: boolean;
  expiresAt: Date | null;
  maxClicks: number | null;
  notes: string | null;
  tags: string[];
  campaignId: string | null;
};

type Campaign = { id: string; name: string };

type Props = {
  link: LinkData;
  campaigns: Campaign[];
};

export function EditLinkForm({ link, campaigns }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [campaignId, setCampaignId] = useState(link.campaignId ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateLinkAction(link.id, {
      title: formData.get("title") as string,
      password: formData.get("password") as string,
      clearPassword: formData.get("clearPassword") === "on",
      expiresAt: formData.get("expiresAt") as string,
      clearExpiry: formData.get("clearExpiry") === "on",
      maxClicks: formData.get("maxClicks") as string,
      clearMaxClicks: formData.get("clearMaxClicks") === "on",
      notes: formData.get("notes") as string,
      tags: formData.get("tags") as string,
      campaignId,
    });

    setIsPending(false);
    if (!result.success) toast.error(result.message);
    else toast.success(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={link.title ?? ""} placeholder="Link title" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tags">Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input
              id="edit-tags"
              name="tags"
              defaultValue={link.tags.join(", ")}
              placeholder="e.g. social, launch, q4"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              name="notes"
              defaultValue={link.notes ?? ""}
              placeholder="Internal notes about this link"
              className="min-h-20 resize-none"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderKanban className="h-4 w-4 text-primary" />
            Campaign
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={campaignId || "none"} onValueChange={(v) => setCampaignId(v === "none" ? "" : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No campaign</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Security &amp; limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-password">New password</Label>
            <Input
              id="edit-password"
              name="password"
              type="password"
              placeholder={link.isPasswordProtected ? "Change password…" : "Add password…"}
              disabled={isPending}
            />
            {link.isPasswordProtected && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" name="clearPassword" className="h-3 w-3" />
                Remove password protection
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-expires">Expiry date</Label>
            <Input
              id="edit-expires"
              name="expiresAt"
              type="datetime-local"
              defaultValue={
                link.expiresAt
                  ? new Date(link.expiresAt.getTime() - link.expiresAt.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              disabled={isPending}
            />
            {link.expiresAt && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" name="clearExpiry" className="h-3 w-3" />
                Remove expiry (make permanent)
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-maxClicks">Max clicks</Label>
            <Input
              id="edit-maxClicks"
              name="maxClicks"
              type="number"
              min="1"
              defaultValue={link.maxClicks ?? ""}
              placeholder="No limit"
              disabled={isPending}
            />
            {link.maxClicks && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" name="clearMaxClicks" className="h-3 w-3" />
                Remove click limit
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
