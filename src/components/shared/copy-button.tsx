"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  ariaLabel,
  variant = "secondary",
  size = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  const accessibleName = ariaLabel || (copied ? copiedLabel : label) || "Copy";

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy} aria-label={accessibleName}>
      {copied ? (
        <>
          <Check className={size === "icon" ? "h-4 w-4" : "mr-2 h-4 w-4"} />
          {size !== "icon" && copiedLabel}
        </>
      ) : (
        <>
          <Copy className={size === "icon" ? "h-4 w-4" : "mr-2 h-4 w-4"} />
          {size !== "icon" && label}
        </>
      )}
    </Button>
  );
}
