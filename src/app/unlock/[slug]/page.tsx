import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

import { hasUnlockAccess } from "@/server/redirects/handle-password-redirect";
import { resolveSlug } from "@/server/redirects/resolve-slug";
import { GuestPasswordForm } from "@/features/guest-links/components/guest-password-form";

type UnlockPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UnlockPage({ params }: UnlockPageProps) {
  const { slug } = await params;
  const headerList = await headers();

  const resolved = await resolveSlug(slug, headerList.get("host"));

  if (!resolved || !resolved.isActive) {
    redirect("/link-unavailable");
  }

  if (resolved.expiresAt !== null && resolved.expiresAt < new Date()) {
    redirect("/link-expired");
  }

  if (!resolved.isPasswordProtected) {
    redirect(`/${slug}`);
  }

  const alreadyUnlocked = await hasUnlockAccess(slug);

  if (alreadyUnlocked) {
    redirect(`/${slug}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <GuestPasswordForm slug={slug} />
    </main>
  );
}
