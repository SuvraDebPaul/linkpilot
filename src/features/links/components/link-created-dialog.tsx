"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Copy, BarChart2, Check, Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ── Social share platforms ──────────────────────────────────────────────────

type Platform = {
  name: string;
  color: string;
  textColor?: string;
  icon: React.ReactNode;
  href: (url: string) => string;
};

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.012a.75.75 0 0 0 .931.931l5.167-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.985-1.372l-.357-.214-3.698 1.053 1.053-3.698-.214-.357A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

const PLATFORMS: Platform[] = [
  {
    name: "WhatsApp",
    color: "bg-[#25D366]",
    textColor: "text-white",
    icon: <WaIcon />,
    href: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    color: "bg-[#1877F2]",
    textColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.02 10.125 11.927v-8.436H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.436C19.612 23.093 24 18.1 24 12.073z" />
      </svg>
    ),
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Instagram",
    color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
    textColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    href: (url) => `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "X",
    color: "bg-black",
    textColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Threads",
    color: "bg-black",
    textColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 1.354-.012 2.52-.195 3.465-.544 1.035-.382 1.676-.956 1.904-1.705.163-.527.134-1.173-.09-1.978-.25-.903-.786-1.656-1.584-2.24-.738 3.942-3.088 4.386-4.814 4.386h-.012c-1.16-.004-2.187-.34-2.894-1.044-.79-.788-1.133-1.94-1.073-3.23.052-1.158.444-2.2 1.077-2.908.74-.82 1.826-1.262 3.134-1.284h.03c1.55 0 2.773.54 3.58 1.56.684.863 1.042 2.032 1.064 3.476.027 2.27-.647 4.068-1.944 5.202C13.698 23.68 12.937 24 12.186 24zm-2.51-8.99c-.63 0-1.115.218-1.448.647-.375.484-.493 1.17-.459 1.857.019.403.138.72.354.944.232.238.598.36 1.089.363 1.28.001 2.18-.627 2.38-3.81a5.2 5.2 0 0 0-1.916-.001z" />
      </svg>
    ),
    href: (url) => `https://www.threads.net/intent/post?text=${encodeURIComponent(url)}`,
  },
  {
    name: "Email",
    color: "bg-muted border border-border",
    textColor: "text-foreground",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    href: (url) =>
      `mailto:?subject=${encodeURIComponent("Check out this link")}&body=${encodeURIComponent(url)}`,
  },
];

// ── Component ───────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  shortCode: string;
  linkId: string;
  onClose: () => void;
  onCreateAnother: () => void;
};

export function LinkCreatedDialog({ open, shortCode, linkId, onClose, onCreateAnother }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${shortCode}`;

  // Generate QR code client-side
  useEffect(() => {
    if (!open || !shortCode) return;
    QRCode.toDataURL(shortUrl, { margin: 2, width: 240, color: { dark: "#000000", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [open, shortUrl, shortCode]);

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${shortCode}-qr.png`;
    a.click();
  }

  function handleViewDetails() {
    router.push(`/dashboard/links/${linkId}`);
    onClose();
  }

  function handleCreateAnother() {
    onCreateAnother();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Your link is ready! 🎉
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Copy your link or share it using the quick-share buttons below.
          </p>
        </DialogHeader>

        {/* ── URL + QR card ── */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-4">
          {/* Short URL */}
          <p className="text-center text-lg font-bold text-primary break-all">
            {shortUrl.replace(/^https?:\/\//, "")}
          </p>

          {/* QR code */}
          <div className="flex justify-center">
            {qrDataUrl ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR code"
                  className="h-36 w-36 rounded-lg border border-border"
                />
                <button
                  onClick={handleDownloadQr}
                  className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Download QR code"
                >
                  <Download className="h-6 w-6 text-white" />
                </button>
              </div>
            ) : (
              <div className="h-36 w-36 animate-pulse rounded-lg bg-muted" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleViewDetails}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              View details
            </Button>
            <Button className="flex-1" onClick={handleCopy}>
              {copied ? (
                <><Check className="mr-2 h-4 w-4" /> Copied!</>
              ) : (
                <><Copy className="mr-2 h-4 w-4" /> Copy link</>
              )}
            </Button>
          </div>
        </div>

        {/* ── Social share ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
            Share on
          </p>
          <div className="flex items-start justify-center gap-4 flex-wrap">
            {PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.href(shortUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${platform.color} ${platform.textColor ?? ""} shadow-sm transition-transform group-hover:scale-110`}
                >
                  {platform.icon}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-sm">
          <span className="text-muted-foreground">On a roll? Don&apos;t stop now!</span>
          <button
            onClick={handleCreateAnother}
            className="font-medium text-primary hover:underline"
          >
            Create another link →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
