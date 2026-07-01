"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateOgTagsAction } from "@/features/links/actions/og-tags.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanTier } from "@/lib/plans";

type Props = {
  linkId: string;
  plan: PlanTier;
  initialTitle: string | null;
  initialDescription: string | null;
  initialImage: string | null;
};

export function OgTagsForm({ linkId, plan, initialTitle, initialDescription, initialImage }: Props) {
  const isPro = plan === "pro";
  const [ogTitle, setOgTitle] = useState(initialTitle ?? "");
  const [ogDescription, setOgDescription] = useState(initialDescription ?? "");
  const [ogImage, setOgImage] = useState(initialImage ?? "");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    const result = await updateOgTagsAction(linkId, { ogTitle, ogDescription, ogImage });
    setIsPending(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  const hasPreview = ogTitle || ogDescription || ogImage;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Social Preview</CardTitle>
          {!isPro && (
            <Badge variant="secondary" className="text-xs">Pro</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isPro ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">Custom OG tags</p>
            <p className="text-xs text-muted-foreground">
              Control the title, description, and image shown when your link is shared
              on social media. Available on Pro.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/settings/billing">Upgrade to Pro</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              These tags are shown when your short link is shared on Facebook, Twitter,
              LinkedIn, and other social platforms.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="ogTitle" className="text-xs">Title</Label>
              <Input
                id="ogTitle"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder="e.g. Check out our summer sale"
                maxLength={120}
                disabled={isPending}
              />
              <p className="text-right text-xs text-muted-foreground">{ogTitle.length}/120</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ogDescription" className="text-xs">Description</Label>
              <Textarea
                id="ogDescription"
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder="e.g. Up to 50% off all products this weekend only"
                maxLength={300}
                rows={2}
                className="resize-none"
                disabled={isPending}
              />
              <p className="text-right text-xs text-muted-foreground">{ogDescription.length}/300</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ogImage" className="text-xs">Image URL</Label>
              <Input
                id="ogImage"
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200×630px</p>
            </div>

            {/* Live preview card */}
            {hasPreview && (
              <div className="rounded-lg border border-border overflow-hidden">
                {ogImage && (
                  <div className="h-32 bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImage}
                      alt="OG preview"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="p-3 space-y-0.5">
                  {ogTitle && (
                    <p className="text-sm font-semibold text-foreground truncate">{ogTitle}</p>
                  )}
                  {ogDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{ogDescription}</p>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full" size="sm">
              {isPending ? "Saving…" : "Save preview"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
