import type { GuestLinkExpiryPreset } from "@/features/guest-links/types/guest-link.types";

export const guestLinkExpiryOptions: {
  label: string;
  value: GuestLinkExpiryPreset;
}[] = [
  { label: "1 hour", value: "1h" },
  { label: "6 hours", value: "6h" },
  { label: "24 hours", value: "24h" },
  { label: "3 days", value: "3d" },
  { label: "7 days", value: "7d" },
];

export const guestLinkExpiryMs: Record<GuestLinkExpiryPreset, number> = {
  "1h": 1 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export function getGuestLinkExpiryDate(preset: GuestLinkExpiryPreset) {
  return new Date(Date.now() + guestLinkExpiryMs[preset]);
}

export function getGuestLinkDeleteAfterDate() {
  return new Date(Date.now() + guestLinkExpiryMs["7d"]);
}
