import { NextResponse } from "next/server";

import { createGuestLinkAction } from "@/features/guest-links/actions/guest-link.actions";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await createGuestLinkAction(body, req);

  const status = result.success ? 201 : result.rateLimited ? 429 : 400;
  return NextResponse.json(result, { status });
}
