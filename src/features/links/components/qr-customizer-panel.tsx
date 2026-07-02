"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Download, Save, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/shared/image-uploader";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { saveQrSettingsAction } from "@/features/links/actions/qr-settings.actions";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const PREVIEW_SIZE = 280;

const SIZES = [
  { label: "320px", value: 320 },
  { label: "512px", value: 512 },
  { label: "1024px", value: 1024 },
] as const;

const EC_LEVELS = [
  { label: "L", value: "L", title: "Low (7%)" },
  { label: "M", value: "M", title: "Medium (15%)" },
  { label: "Q", value: "Q", title: "Quartile (25%)" },
  { label: "H", value: "H", title: "High (30%) — best with logo" },
] as const;

type EcLevel = "L" | "M" | "Q" | "H";
type VerifiedDomain = { id: string; domain: string };

interface Props {
  shortCode: string;
  linkId?: string;
  savedFgColor?: string;
  savedBgColor?: string;
  savedEcLevel?: string;
  savedMargin?: number;
  savedLogoUrl?: string;
  brandColor?: string | null;
  brandLogoUrl?: string | null;
  verifiedDomains?: VerifiedDomain[];
  initialCustomDomainId?: string | null;
}

async function drawQr(
  canvas: HTMLCanvasElement,
  url: string,
  renderSize: number,
  fg: string,
  bg: string,
  margin: number,
  ecLevel: EcLevel,
  withLogo: boolean,
  logoSrc: string,
) {
  const fgColor = HEX_RE.test(fg) ? fg : "#000000";
  const bgColor = HEX_RE.test(bg) ? bg : "#ffffff";

  await QRCode.toCanvas(canvas, url, {
    margin,
    width: renderSize,
    errorCorrectionLevel: ecLevel,
    color: { dark: fgColor, light: bgColor },
  });

  if (withLogo && logoSrc) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(); return; }
        const logoSize = Math.round(renderSize * 0.2);
        const cx = (renderSize - logoSize) / 2;
        const cy = (renderSize - logoSize) / 2;
        const pad = Math.round(renderSize * 0.025);
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(cx - pad, cy - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
        ctx.fill();
        ctx.drawImage(img, cx, cy, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logoSrc;
    });
  }
}

export function QrCustomizerPanel({
  shortCode, linkId,
  savedFgColor, savedBgColor, savedEcLevel, savedMargin, savedLogoUrl,
  brandColor, brandLogoUrl,
  verifiedDomains = [],
  initialCustomDomainId,
}: Props) {
  const router = useRouter();
  const previewRef = useRef<HTMLCanvasElement>(null);

  const initFg = savedFgColor ?? (brandColor && HEX_RE.test(brandColor) ? brandColor : "#000000");
  const initBg = savedBgColor ?? "#ffffff";
  const initLogoUrl = savedLogoUrl ?? brandLogoUrl ?? "";

  const [customDomainId, setCustomDomainId] = useState(initialCustomDomainId ?? "");
  const [slug, setSlug] = useState(shortCode);
  const [fg, setFg] = useState(initFg);
  const [fgText, setFgText] = useState(initFg);
  const [bg, setBg] = useState(initBg);
  const [bgText, setBgText] = useState(initBg);
  const [margin, setMargin] = useState(savedMargin ?? 2);
  const [ecLevel, setEcLevel] = useState<EcLevel>((savedEcLevel as EcLevel) ?? "M");
  const [downloadSize, setDownloadSize] = useState<320 | 512 | 1024>(512);
  const [format, setFormat] = useState<"png" | "svg">("png");
  const [logoUrl, setLogoUrl] = useState(initLogoUrl);
  const [withLogo, setWithLogo] = useState(!!initLogoUrl);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedDomain = verifiedDomains.find((d) => d.id === customDomainId)?.domain;
  const defaultDomain = siteConfig.url.replace(/^https?:\/\//, "");
  const previewUrl = `https://${selectedDomain ?? defaultDomain}/${slug.trim() || shortCode}`;

  const slugChanged = slug.trim() !== "" && slug.trim() !== shortCode;

  // Auto-bump EC to H when logo is enabled so data is recoverable
  function handleWithLogoChange(next: boolean) {
    setWithLogo(next);
    if (next && ecLevel !== "H") setEcLevel("H");
  }

  const renderPreview = useCallback(async () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    await drawQr(canvas, previewUrl, PREVIEW_SIZE, fg, bg, margin, ecLevel, withLogo, logoUrl);
  }, [previewUrl, fg, bg, margin, ecLevel, withLogo, logoUrl]);

  // Re-render live whenever any option changes
  useEffect(() => { renderPreview(); }, [renderPreview]);

  function applyFgText(v: string) { setFgText(v); if (HEX_RE.test(v)) setFg(v); }
  function applyBgText(v: string) { setBgText(v); if (HEX_RE.test(v)) setBg(v); }

  async function handleSave() {
    if (!linkId) return;
    setIsSaving(true);
    try {
      const result = await saveQrSettingsAction(linkId, {
        fgColor: fg,
        bgColor: bg,
        ecLevel,
        margin,
        logoUrl: withLogo ? logoUrl : "",
        customDomainId,
        customSlug: slugChanged ? slug.trim() : "",
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      if (format === "svg") {
        const fgColor = HEX_RE.test(fg) ? fg : "#000000";
        const bgColor = HEX_RE.test(bg) ? bg : "#ffffff";
        const svgString = await QRCode.toString(previewUrl, {
          type: "svg",
          margin,
          errorCorrectionLevel: ecLevel,
          color: { dark: fgColor, light: bgColor },
        });
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${shortCode}-qr.svg`;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        const offscreen = document.createElement("canvas");
        await drawQr(offscreen, previewUrl, downloadSize, fg, bg, margin, ecLevel, withLogo, logoUrl);
        const a = document.createElement("a");
        a.href = offscreen.toDataURL("image/png");
        a.download = `${shortCode}-qr-${downloadSize}.png`;
        a.click();
      }
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Live preview */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/30 p-4">
          <canvas
            ref={previewRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="h-56 w-56 rounded-lg"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
        <p className="max-w-[220px] break-all text-center text-[11px] text-muted-foreground">
          {previewUrl.replace(/^https?:\/\//, "")}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-5">
        {/* Link URL — domain + short code */}
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" />
            Link URL
          </p>

          {verifiedDomains.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Domain</Label>
              <Select value={customDomainId || "default"} onValueChange={(v) => setCustomDomainId(v === "default" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">{defaultDomain} (default)</SelectItem>
                  {verifiedDomains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Short code</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={shortCode}
              className="font-mono text-sm"
              maxLength={64}
            />
            {slugChanged && (
              <p className="text-xs text-amber-600">
                Changing this breaks any links or printed QR codes already shared with &quot;{shortCode}&quot;.
              </p>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Foreground</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={HEX_RE.test(fg) ? fg : "#000000"}
                onChange={(e) => { setFg(e.target.value); setFgText(e.target.value); }}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-card p-0.5"
              />
              <Input value={fgText} onChange={(e) => applyFgText(e.target.value)} placeholder="#000000" className="font-mono text-xs" maxLength={7} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Background</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={HEX_RE.test(bg) ? bg : "#ffffff"}
                onChange={(e) => { setBg(e.target.value); setBgText(e.target.value); }}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-card p-0.5"
              />
              <Input value={bgText} onChange={(e) => applyBgText(e.target.value)} placeholder="#ffffff" className="font-mono text-xs" maxLength={7} />
            </div>
          </div>
        </div>

        {/* Error correction + Margin side by side */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Error correction</Label>
            <div className="flex gap-2">
              {EC_LEVELS.map((ec) => (
                <button
                  key={ec.value}
                  type="button"
                  title={ec.title}
                  onClick={() => setEcLevel(ec.value)}
                  className={cn(
                    "flex-1 rounded-md border py-1.5 text-xs font-semibold transition-colors",
                    ecLevel === ec.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {ec.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {EC_LEVELS.find((e) => e.value === ecLevel)?.title}
              {withLogo && ecLevel !== "H" && (
                <span className="ml-1 text-amber-600"> — H recommended when using a logo</span>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Quiet zone (margin)</Label>
              <span className="text-xs font-semibold text-foreground">{margin}</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span><span>Default (2)</span><span>Wide</span>
            </div>
          </div>
        </div>

        {/* Center logo */}
        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Center logo</Label>
              {withLogo && <p className="text-xs text-muted-foreground">EC level auto-set to H</p>}
            </div>
            <Switch checked={withLogo} onCheckedChange={handleWithLogoChange} />
          </div>
          {withLogo && (
            <ImageUploader
              value={logoUrl}
              onChange={setLogoUrl}
              folder="qr-logos"
              shape="square"
              size={64}
            />
          )}
        </div>

        {/* Format + Download size */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Format</Label>
            <div className="flex gap-2">
              {(["png", "svg"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 rounded-md border py-1.5 text-xs font-semibold uppercase transition-colors",
                    format === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {format === "png" ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Download size</Label>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setDownloadSize(s.value as 320 | 512 | 1024)}
                    className={cn(
                      "flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors",
                      downloadSize === s.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="self-end text-xs text-muted-foreground">
              SVG is resolution-independent — ideal for print and large displays. Logo overlay is PNG-only.
            </p>
          )}
        </div>

        {/* Save + Download */}
        <div className="flex gap-2">
          {linkId && (
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || saved}
              className="flex-1 gap-2"
            >
              {saved ? (
                <><Check className="h-4 w-4 text-primary" /> Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> {isSaving ? "Saving…" : "Save settings"}</>
              )}
            </Button>
          )}
          <Button onClick={handleDownload} disabled={isDownloading} className={linkId ? "flex-1 gap-2" : "w-full gap-2"}>
            <Download className="h-4 w-4" />
            {isDownloading
              ? "Generating…"
              : format === "svg"
                ? "Download SVG"
                : `Download ${downloadSize}px PNG`}
          </Button>
        </div>
      </div>
    </div>
  );
}
