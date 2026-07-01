import { siteConfig } from "@/config/site";

type ReportLink = {
  id: string;
  title: string | null;
  shortCode: string;
  isActive: boolean;
  expiresAt: Date | null;
  _count: { clicks: number };
};

type DeviceRow = { device: string; count: number };

type Props = {
  campaignName: string;
  campaignDescription: string | null;
  links: ReportLink[];
  deviceBreakdown?: DeviceRow[];
  from?: Date | null;
  to?: Date | null;
};

export function ReportContent({ campaignName, campaignDescription, links, deviceBreakdown, from, to }: Props) {
  const now = new Date();

  const totalClicks = links.reduce((s, l) => s + l._count.clicks, 0);
  const activeLinks = links.filter(
    (l) => l.isActive && (!l.expiresAt || l.expiresAt > now),
  ).length;

  const generatedAt = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const periodLabel =
    from || to
      ? `${from ? from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} to ${to ? to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "today"}`
      : "All time";

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:shadow-none print:border-0 print:p-0">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {siteConfig.name} — Campaign Report
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{campaignName}</h1>
        {campaignDescription && (
          <p className="mt-1 text-slate-500">{campaignDescription}</p>
        )}
        <p className="mt-3 text-sm text-slate-400">
          Generated {generatedAt} · Period: {periodLabel}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total links", value: links.length },
          { label: "Active links", value: activeLinks },
          { label: "Total clicks", value: totalClicks.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-950">{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Links breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Link performance</h2>
        {links.length === 0 ? (
          <p className="text-sm text-slate-400">No links in this campaign.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2 pr-4">Link</th>
                <th className="pb-2 pr-4 text-right">Clicks</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links
                .slice()
                .sort((a, b) => b._count.clicks - a._count.clicks)
                .map((link) => {
                  const isExpired = link.expiresAt ? link.expiresAt < now : false;
                  const status = isExpired ? "Expired" : link.isActive ? "Active" : "Inactive";
                  return (
                    <tr key={link.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{link.title || link.shortCode}</p>
                        <p className="text-xs text-slate-400">{siteConfig.url}/{link.shortCode}</p>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">
                        {link._count.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-slate-500">{status}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200">
              <tr>
                <td className="pt-3 pr-4 text-sm font-semibold text-slate-950">Total</td>
                <td className="pt-3 pr-4 text-right font-bold text-slate-950">{totalClicks.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Device breakdown */}
      {deviceBreakdown && deviceBreakdown.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Clicks by device</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {deviceBreakdown.map((row) => {
              const pct = totalClicks > 0 ? Math.round((row.count / totalClicks) * 100) : 0;
              return (
                <div key={row.device} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xl font-bold text-slate-950">{pct}%</p>
                  <p className="mt-0.5 text-xs capitalize text-slate-500">{row.device.toLowerCase()}</p>
                  <p className="text-xs text-slate-400">{row.count.toLocaleString()} clicks</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
        {siteConfig.url} · {siteConfig.name}
      </div>
    </div>
  );
}
