import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { getCronJobHealth } from "@/server/queries/admin-system.queries";

export default async function AdminCronJobsPage() {
  const jobs = await getCronJobHealth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Cron Jobs</h1>
      <p className="mt-1 text-sm text-zinc-500">Last run status for each scheduled job.</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last run</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {jobs.map(({ jobName, lastRun }) => (
              <tr key={jobName}>
                <td className="px-4 py-3 font-mono text-xs text-zinc-200">{jobName}</td>
                <td className="px-4 py-3">
                  {!lastRun ? (
                    <span className="flex items-center gap-1.5 text-zinc-500">
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
                <td className="px-4 py-3 text-zinc-400">
                  {lastRun ? lastRun.createdAt.toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {lastRun?.durationMs != null ? `${lastRun.durationMs}ms` : "—"}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
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
