export type GuestLinkExpiryPreset = "1h" | "6h" | "24h" | "3d" | "7d";

export type CreateGuestLinkResponse = {
  success: boolean;
  message: string;
  rateLimited?: boolean;
  data?: {
    shortUrl: string;
    shortCode: string;
    expiresAt: string;
    qrCodeDataUrl?: string;
  };
  fieldErrors?: {
    originalUrl?: string[];
    password?: string[];
    expiryPreset?: string[];
  };
};
