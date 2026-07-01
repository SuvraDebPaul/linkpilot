import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return NextResponse.redirect(new URL("/login?error=expired-token", req.url));
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
