"use client";

import { useEffect, useState } from "react";
import { getAnnouncementBannerAction } from "@/features/public/actions/announcement.actions";
import { DismissibleBanner } from "@/components/shared/dismissible-banner";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<{ enabled: boolean; message: string } | null>(null);

  useEffect(() => {
    getAnnouncementBannerAction().then(setBanner);
  }, []);

  if (!banner?.enabled || !banner.message.trim()) return null;

  return <DismissibleBanner message={banner.message} />;
}
