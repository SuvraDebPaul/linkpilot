"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import QRCode from "qrcode";
import { Download, Package, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LinkItem = {
  id: string;
  title: string | null;
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
};

function QrCard({ link }: { link: LinkItem }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current!, link.shortUrl, {
      margin: 2,
      width: 200,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(() => setReady(true));
  }, [link.shortUrl]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${link.shortCode}-qr.png`;
    a.click();
  }

  function copyUrl() {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center gap-3">
        {/* QR canvas — always 200×200 internally, displayed at fixed CSS size */}
        <div className="relative flex h-40 w-40 items-center justify-center rounded-lg border border-border bg-white">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="h-40 w-40 rounded-lg"
            style={{ imageRendering: "pixelated", opacity: ready ? 1 : 0, transition: "opacity 0.2s" }}
          />
          {!ready && (
            <div className="absolute inset-0 animate-pulse rounded-lg bg-muted" />
          )}
        </div>

        {/* Link info */}
        <div className="w-full min-w-0 text-center space-y-0.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {link.title || link.shortCode}
          </p>
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
          >
            {link.shortUrl.replace(/^https?:\/\//, "")}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <p className="truncate text-xs text-muted-foreground">{link.originalUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1"
            onClick={copyUrl}
            disabled={!ready}
          >
            {copied ? <><Check className="h-3 w-3" /> Copied</> : "Copy URL"}
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs gap-1"
            onClick={download}
            disabled={!ready}
          >
            <Download className="h-3 w-3" /> PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type Props = {
  links: LinkItem[];
  campaignName: string;
};

export function CampaignQrGrid({ links, campaignName }: Props) {
  const [bulkLoading, setBulkLoading] = useState(false);

  async function downloadAll() {
    setBulkLoading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(campaignName.replace(/[^a-z0-9]/gi, "-").toLowerCase()) ?? zip;

      await Promise.all(
        links.map(async (link) => {
          const dataUrl = await QRCode.toDataURL(link.shortUrl, {
            margin: 2,
            width: 512,
            color: { dark: "#000000", light: "#ffffff" },
          });
          const base64 = dataUrl.split(",")[1];
          folder.file(`${link.shortCode}-qr.png`, base64, { base64: true });
        }),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${campaignName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-qr-codes.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBulkLoading(false);
    }
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-semibold text-foreground">No links in this campaign</p>
        <p className="mt-1 text-sm text-muted-foreground">Add links to the campaign to generate QR codes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {links.length} QR code{links.length !== 1 ? "s" : ""} — 512px PNG inside ZIP
        </p>
        <Button onClick={downloadAll} disabled={bulkLoading} className="gap-2">
          <Package className="h-4 w-4" />
          {bulkLoading ? "Generating ZIP…" : "Download all as ZIP"}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {links.map((link) => (
          <QrCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}
