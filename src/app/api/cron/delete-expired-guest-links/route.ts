import { NextResponse } from "next/server";

import { deleteExpiredGuestLinks } from "@/server/services/cleanup.service";
import { runCronJob } from "@/server/services/cron-log.service";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const result = await runCronJob("delete-expired-guest-links", () => deleteExpiredGuestLinks());

  return NextResponse.json({
    success: true,
    message: "Expired guest links deleted successfully.",
    data: result,
  });
}
