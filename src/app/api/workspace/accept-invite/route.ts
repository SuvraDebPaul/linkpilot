import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=invalid-invite", req.url));

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.identifier.startsWith("invite:") || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return NextResponse.redirect(new URL("/login?error=expired-invite", req.url));
  }

  // identifier format: invite:<workspaceId>:<email>
  const parts = record.identifier.split(":");
  const workspaceId = parts[1];
  const email = parts.slice(2).join(":"); // handle emails with colons

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Not logged in — redirect to login then back
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(`/api/workspace/accept-invite?token=${token}`)}`, req.url)
    );
  }

  // Make sure the logged-in user owns the invited email
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
  if (user?.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.redirect(new URL("/dashboard?error=invite-email-mismatch", req.url));
  }

  // Check already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!existing) {
    await prisma.workspaceMember.create({
      data: { userId: session.user.id, workspaceId, role: "MEMBER" },
    });
  }

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/dashboard?joined=1", req.url));
}
