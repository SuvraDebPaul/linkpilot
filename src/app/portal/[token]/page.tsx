import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MousePointerClick, Link2, BarChart2 } from "lucide-react";

import { getClientAccessByToken } from "@/server/queries/client-access.queries";
import { getDemoClientPortal } from "@/lib/demo-stats";
import { Logo } from "@/components/shared/logo";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const access = IS_DEMO
    ? getDemoClientPortal(token)
    : await getClientAccessByToken(token);
  if (!access) return { title: "Portal not found" };
  return {
    title: `${access.clientName ?? "Your"} campaign portal — ${access.workspace.name}`,
  };
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const access = IS_DEMO
    ? getDemoClientPortal(token)
    : await getClientAccessByToken(token);
  if (!access) notFound();

  const { workspace, campaigns, clientName } = access;

  const brandStyle = workspace.brandColor
    ? ({ "--primary": workspace.brandColor, "--primary-foreground": "#ffffff" } as React.CSSProperties)
    : undefined;

  const logoEl = workspace.brandLogoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={workspace.brandLogoUrl}
      alt={workspace.name}
      className="h-8 max-w-[160px] object-contain"
    />
  ) : (
    <Logo />
  );

  return (
    <div className="min-h-screen bg-muted/30" style={brandStyle}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          {logoEl}
          <span className="text-xs text-muted-foreground">{workspace.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {clientName ? `${clientName}'s campaigns` : "Your campaigns"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} shared with you by{" "}
            <span className="font-medium text-foreground">{workspace.name}</span>
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <BarChart2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No campaigns shared yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {campaigns.map(({ campaign }) => {
              const totalClicks = campaign.links.reduce((s, l) => s + l._count.clicks, 0);
              const activeLinks = campaign.links.filter(
                (l) => l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date()),
              ).length;

              return (
                <div
                  key={campaign.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
                >
                  <div>
                    <h2 className="font-semibold text-foreground">{campaign.name}</h2>
                    {campaign.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Total clicks</span>
                      </div>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {totalClicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Link2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Active links</span>
                      </div>
                      <p className="mt-1 text-xl font-bold text-foreground">{activeLinks}</p>
                    </div>
                  </div>

                  {campaign.shareToken && (
                    <Link
                      href={`/report/${campaign.shareToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      View full report <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      {!workspace.hideBranding && (
        <footer className="mt-8 border-t border-border py-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="font-semibold text-foreground hover:underline">
            LinkPilot
          </Link>
        </footer>
      )}
    </div>
  );
}
