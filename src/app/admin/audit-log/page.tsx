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
  normal: "bg-accent text-foreground",
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
      <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} total actions recorded</p>

      <div className="mt-4">
        <AuditLogFilters defaultAction={action ?? ""} defaultTargetType={targetType ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {logs.map((log) => {
              const href = targetHref(log.targetType, log.targetId);
              return (
                <tr key={log.id} className="hover:bg-accent">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-foreground">{log.actorEmail ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-xs ${SEVERITY_CLASSES[getAuditSeverity(log.action)]}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {href ? (
                      <Link href={href} className="text-teal-400 hover:underline">
                        {log.targetType} · {log.targetId?.slice(0, 8)}…
                      </Link>
                    ) : (
                      <span>{log.targetType ?? "—"}</span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No matching audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
