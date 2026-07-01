"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateLinkAction } from "@/features/links/actions/link.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LinkData = {
  id: string;
  title: string | null;
  isActive: boolean;
  isPasswordProtected: boolean;
  expiresAt: Date | null;
  maxClicks: number | null;
  notes: string | null;
  tags: string[];
};

export function EditLinkForm({ link }: { link: LinkData }) {
  const [isPending, setIsPending] = useState(false);

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
    });

    setIsPending(false);
    if (!result.success) toast.error(result.message);
    else toast.success(result.message);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={link.title ?? ""} placeholder="Link title" disabled={isPending} />
          </div>

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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
