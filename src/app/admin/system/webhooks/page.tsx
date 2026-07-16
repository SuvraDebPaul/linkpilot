import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { getWebhookEvents } from "@/server/queries/admin-system.queries";

export default async function AdminWebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ failedOnly?: string; page?: string }>;
}) {
  const { failedOnly, page } = await searchParams;
  const { events, total, pageSize } = await getWebhookEvents(
    { failedOnly: failedOnly === "1" },
    page ? Number(page) : 1,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Stripe Webhooks</h1>
      <p className="mt-1 text-sm text-zinc-500">{total} events recorded</p>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/admin/system/webhooks"
          className={`rounded-lg px-3 py-1.5 ${!failedOnly ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          All
        </Link>
        <Link
          href="/admin/system/webhooks?failedOnly=1"
          className={`rounded-lg px-3 py-1.5 ${failedOnly === "1" ? "bg-red-500/15 text-red-400" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Failed only
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {events.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                  {e.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-200">{e.eventType}</td>
                <td className="px-4 py-3">
                  {e.status === "success" ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <XCircle className="h-4 w-4" /> Error
                    </span>
                  )}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
                  {e.errorMessage ?? "—"}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No webhook events recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
