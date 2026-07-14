"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { ImagePlus, X, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getUploadSignatureAction,
  type UploadFolder,
} from "@/features/uploads/actions/upload.actions";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  shape?: "circle" | "square";
  size?: number;
  disabled?: boolean;
};

export function ImageUploader({
  value,
  onChange,
  folder,
  shape = "square",
  size = 96,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displaySrc = localPreview ?? value;
  const hasPendingFile = Boolean(file);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (localPreview) URL.revokeObjectURL(localPreview);
    setFile(selected);
    setLocalPreview(URL.createObjectURL(selected));
  }

  function cancelSelection() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setFile(null);
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage() {
    cancelSelection();
    onChange("");
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const sig = await getUploadSignatureAction(folder);
      if (!sig.success) {
        toast.error(sig.message);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("allowed_formats", sig.allowedFormats);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.secure_url) {
        throw new Error(json.error?.message || "Upload failed");
      }

      onChange(json.secure_url);
      cancelSelection();
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/40",
          shape === "circle" ? "rounded-full" : "rounded-lg",
        )}
        style={{ width: size, height: size }}
      >
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {hasPendingFile ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={cancelSelection} disabled={uploading}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Change
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <ImagePlus className="mr-1.5 h-3.5 w-3.5" /> {value ? "Change image" : "Choose image"}
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={removeImage} disabled={disabled}>
                <X className="mr-1.5 h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {hasPendingFile ? "Preview shown — click Upload to save it." : "PNG, JPG, or GIF."}
        </p>
      </div>
    </div>
  );
}
