import Link from "next/link";
import { getAdminAuditLog } from "@/server/queries/admin-audit.queries";
import { AuditLogFilters } from "@/components/admin/audit-log-filters";
import { getAuditSeverity } from "@/lib/audit-severity";

function targetHref(targetType: string | null, targetId: string | null) {
  if (!targetType || !targetId) return null;
  if (targetType === "User") return `/admin/users/${targetId}`;
  if (targetType === "Workspace") return `/admin/workspaces/${targetId}`;
  return null;
}

const SEVERITY_CLASSES = {
  destructive: "bg-red-500/15 text-red-400",
  high: "bg-amber-500/15 text-amber-400",
  normal: "bg-zinc-800 text-zinc-300",
} as const;

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; targetType?: string; page?: string }>;
}) {
  const { action, targetType, page } = await searchParams;
  const { logs, total, pageSize } = await getAdminAuditLog(
    { action, targetType },
    page ? Number(page) : 1,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Audit Log</h1>
      <p className="mt-1 text-sm text-zinc-500">{total} total actions recorded</p>

      <div className="mt-4">
        <AuditLogFilters defaultAction={action ?? ""} defaultTargetType={targetType ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {logs.map((log) => {
              const href = targetHref(log.targetType, log.targetId);
              return (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{log.actorEmail ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-xs ${SEVERITY_CLASSES[getAuditSeverity(log.action)]}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {href ? (
                      <Link href={href} className="text-teal-400 hover:underline">
                        {log.targetType} · {log.targetId?.slice(0, 8)}…
                      </Link>
                    ) : (
                      <span>{log.targetType ?? "—"}</span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No matching audit entries.
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
