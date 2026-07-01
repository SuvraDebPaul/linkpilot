"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrDownloadButton({
  dataUrl,
  shortCode,
}: {
  dataUrl: string;
  shortCode: string;
}) {
  function handleDownload() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `linkpilot-${shortCode}-qr.png`;
    a.click();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Download QR
    </Button>
  );
}
