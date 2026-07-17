import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { getCronJobHealth } from "@/server/queries/admin-system.queries";

export default async function AdminCronJobsPage() {
  const jobs = await getCronJobHealth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Cron Jobs</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last run status for each scheduled job.</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last run</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {jobs.map(({ jobName, lastRun }) => (
              <tr key={jobName}>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{jobName}</td>
                <td className="px-4 py-3">
                  {!lastRun ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <HelpCircle className="h-4 w-4" /> Never run
                    </span>
                  ) : lastRun.status === "success" ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <XCircle className="h-4 w-4" /> Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lastRun ? lastRun.createdAt.toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lastRun?.durationMs != null ? `${lastRun.durationMs}ms` : "—"}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">
                  {lastRun?.message ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
