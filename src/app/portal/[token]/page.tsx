import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MousePointerClick, Link2, BarChart2, FolderKanban } from "lucide-react";

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

  const grandTotalClicks = campaigns.reduce(
    (s, { campaign }) => s + campaign.links.reduce((cs, l) => cs + l._count.clicks, 0),
    0,
  );
  const ACCENTS = [
    { chip: "bg-teal-500/10", icon: "text-teal-600", bar: "bg-teal-500" },
    { chip: "bg-violet-500/10", icon: "text-violet-600", bar: "bg-violet-500" },
    { chip: "bg-amber-500/10", icon: "text-amber-600", bar: "bg-amber-500" },
    { chip: "bg-sky-500/10", icon: "text-sky-600", bar: "bg-sky-500" },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/20" style={brandStyle}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          {logoEl}
          <span className="text-xs font-medium text-muted-foreground">{workspace.name}</span>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary to-primary/70 px-6 py-10 text-primary-foreground">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
            Client portal
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {clientName ? `${clientName}'s campaigns` : "Your campaigns"}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} shared by{" "}
            <span className="font-semibold">{workspace.name}</span>
            {grandTotalClicks > 0 && (
              <> · {grandTotalClicks.toLocaleString()} total clicks tracked</>
            )}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <BarChart2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No campaigns shared yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {campaigns.map(({ campaign }, i) => {
              const totalClicks = campaign.links.reduce((s, l) => s + l._count.clicks, 0);
              const activeLinks = campaign.links.filter(
                (l) => l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date()),
              ).length;
              const accent = ACCENTS[i % ACCENTS.length];
              const share = totalClicks > 0 && grandTotalClicks > 0
                ? Math.round((totalClicks / grandTotalClicks) * 100)
                : 0;

              return (
                <div
                  key={campaign.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}>
                      <FolderKanban className={`h-5 w-5 ${accent.icon}`} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-foreground">{campaign.name}</h2>
                      {campaign.description ? (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                          {campaign.description}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm italic text-muted-foreground/50">No description</p>
                      )}
                    </div>
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

                  {grandTotalClicks > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Share of total clicks</span>
                        <span className="font-semibold text-foreground">{share}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${Math.max(share, 3)}%` }} />
                      </div>
                    </div>
                  )}

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
