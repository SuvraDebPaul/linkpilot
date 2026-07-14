import { NextResponse } from "next/server";
import { handleRootRedirect } from "@/server/redirects/handle-root-redirect";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    return await handleRootRedirect(req, slug);
  } catch (err) {
    // This is the single busiest endpoint in the app (every short-link click
    // goes through it) — an unhandled error here must never surface Next's
    // raw error page to an anonymous visitor.
    console.error("[redirect] unexpected error:", err);
    return NextResponse.redirect(new URL("/link-unavailable", req.url));
  }
}
