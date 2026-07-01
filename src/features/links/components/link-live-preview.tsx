"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Link2 } from "lucide-react";
import { siteConfig } from "@/config/site";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const PREVIEW_SIZE = 200;

type Props = {
  slug: string;
  fgColor: string;
  bgColor: string;
  ecLevel: "L" | "M" | "Q" | "H";
  margin: number;
  customDomain?: string;
};

export function LinkLivePreview({ slug, fgColor, bgColor, ecLevel, margin, customDomain }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domain = customDomain || siteConfig.url.replace(/^https?:\/\//, "");
  const displaySlug = slug.trim() || "your-slug";
  const previewUrl = customDomain
    ? `https://${customDomain}/${slug.trim() || "preview"}`
    : `${siteConfig.url}/${slug.trim() || "preview"}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fg = HEX_RE.test(fgColor) ? fgColor : "#000000";
    const bg = HEX_RE.test(bgColor) ? bgColor : "#ffffff";

    QRCode.toCanvas(canvas, previewUrl, {
      margin,
      width: PREVIEW_SIZE,
      errorCorrectionLevel: ecLevel,
      color: { dark: fg, light: bg },
    }).catch(() => {});
  }, [previewUrl, fgColor, bgColor, ecLevel, margin]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-fit items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-sm transition-transform">
        <canvas ref={canvasRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE} className="h-[160px] w-[160px]" />
      </div>

      <div className="flex w-full items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          <span className="text-muted-foreground">{domain}/</span>
          <span className={slug.trim() ? "text-foreground" : "text-muted-foreground italic"}>{displaySlug}</span>
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Your QR code and short link update live as you type
      </p>
    </div>
  );
}
