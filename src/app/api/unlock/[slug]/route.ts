import { NextResponse } from "next/server";

import { unlockProtectedLink } from "@/server/redirects/handle-password-redirect";

type UnlockRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(req: Request, context: UnlockRouteContext) {
  const { slug } = await context.params;
  const body = (await req.json()) as { password?: string };

  if (!body.password) {
    return NextResponse.json(
      {
        success: false,
        message: "Password is required.",
      },
      { status: 400 },
    );
  }

  const result = await unlockProtectedLink({
    slug,
    password: body.password,
  });

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
