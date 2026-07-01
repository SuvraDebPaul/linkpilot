import { handleRootRedirect } from "@/server/redirects/handle-root-redirect";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  return handleRootRedirect(req, slug);
}
