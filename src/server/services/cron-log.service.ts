import { prisma } from "@/server/db/prisma";

// Wraps a cron job's actual work so /admin/system/cron-jobs can show whether
// each of the 5 scheduled jobs is actually firing on schedule and succeeding,
// instead of that only being discoverable when someone notices a missing email.
export async function runCronJob<T>(jobName: string, handler: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await handler();
    await prisma.cronRunLog.create({
      data: { jobName, status: "success", durationMs: Date.now() - start },
    });
    return result;
  } catch (err) {
    await prisma.cronRunLog.create({
      data: {
        jobName,
        status: "error",
        message: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      },
    });
    throw err;
  }
}
