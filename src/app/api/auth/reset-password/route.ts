import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

export async function POST(req: Request) {
  const { token, password } = await req.json() as { token?: string; password?: string };
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith("reset:") || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "Link expired or invalid" }, { status: 400 });
  }

  const email = record.identifier.replace("reset:", "");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { password: passwordHash },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
