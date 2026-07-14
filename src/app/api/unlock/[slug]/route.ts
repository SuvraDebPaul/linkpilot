import { NextResponse } from "next/server";

import { unlockProtectedLink } from "@/server/redirects/handle-password-redirect";

type UnlockRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(req: Request, context: UnlockRouteContext) {
  const { slug } = await context.params;

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  if (!body.password) {
    return NextResponse.json(
      {
        success: false,
        message: "Password is required.",
      },
      { status: 400 },
    );
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";

  const result = await unlockProtectedLink({
    slug,
    password: body.password,
    ip,
    host: req.headers.get("host"),
  });

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
