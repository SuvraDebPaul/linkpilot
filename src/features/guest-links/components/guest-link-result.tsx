"use client";

import { Download } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/shared/copy-button";
import { QrPreview } from "@/components/shared/qr-preview";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CreateGuestLinkResponse } from "@/features/guest-links/types/guest-link.types";

type GuestLinkResultProps = {
  result: NonNullable<CreateGuestLinkResponse["data"]>;
};

export function GuestLinkResult({ result }: GuestLinkResultProps) {
  function handleDownloadQr() {
    if (!result.qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.href = result.qrCodeDataUrl;
    link.download = `linkpilot-${result.shortCode}-qr.png`;
    link.click();
  }

  const expiresAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(result.expiresAt));

  return (
    <Card className="h-full border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            label="Temporary link ready"
            variant="active"
            className="px-4 py-3"
          />
          <StatusBadge
            label="Guest link"
            variant="guest"
            className="px-4 py-3"
          />
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Short URL
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={result.shortUrl}
              readOnly
              className="h-11 flex-1 rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground outline-none"
            />

            <CopyButton value={result.shortUrl} />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Expires: {expiresAt}
          </p>
        </div>

        {result.qrCodeDataUrl ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]">
            <QrPreview src={result.qrCodeDataUrl} size={150} />

            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-foreground">
                QR code included
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Download this QR code and use it for quick sharing, posters,
                documents, or temporary campaigns.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadQr}
                className="mt-4 w-fit"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <p className="text-sm font-semibold text-foreground">
            This link expires in 7 days. Want it to last forever?
          </p>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            A free account gives you <strong>50 permanent links</strong>,{" "}
            <strong>2 campaigns</strong>, and{" "}
            <strong>click & device analytics</strong> — all free, no card
            needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/register">Create free account</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">See all plans</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
