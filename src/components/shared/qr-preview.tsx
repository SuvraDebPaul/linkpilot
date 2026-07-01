import Image from "next/image";

type QrPreviewProps = {
  src: string;
  alt?: string;
  size?: number;
};

export function QrPreview({
  src,
  alt = "QR code",
  size = 160,
}: QrPreviewProps) {
  return (
    <div className="flex w-fit items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-sm">
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-auto w-auto"
        unoptimized
      />
    </div>
  );
}
