"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

import { Share2 } from "lucide-react";
import { updateOgTagsAction } from "@/features/links/actions/og-tags.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanGateCard } from "@/components/shared/plan-gate-card";
import { ImageUploader } from "@/components/shared/image-uploader";
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

  if (!isPro) {
    return (
      <PlanGateCard
        icon={Share2}
        title="Social Preview"
        description="Control what shows up when your link is shared on social media."
        lockedTitle="Custom OG tags"
        lockedDescription="Set the title, description, and image shown when your link is shared on social media."
        requiredPlanLabel="Pro"
        upgradeLabel="Upgrade to Pro"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4 text-primary" />
          Social Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              <Label className="text-xs">Image</Label>
              <ImageUploader
                value={ogImage}
                onChange={setOgImage}
                folder="og-images"
                shape="square"
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
      </CardContent>
    </Card>
  );
}
