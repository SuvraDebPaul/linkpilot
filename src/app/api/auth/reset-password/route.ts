import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

export async function POST(req: Request) {
  let token: string | undefined;
  let password: string | undefined;
  try {
    ({ token, password } = (await req.json()) as { token?: string; password?: string });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record || !record.identifier.startsWith("reset:") || record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
      return NextResponse.json({ error: "Link expired or invalid" }, { status: 400 });
    }

    const email = record.identifier.replace("reset:", "");
    const passwordHash = await bcrypt.hash(password, 12);

    // The user this token belongs to may have deleted their account since the
    // reset link was requested — treat that the same as an expired link.
    await prisma.user.update({
      where: { email },
      // Bump sessionVersion so any session active before this reset — e.g. a
      // hijacked one the user is resetting their password specifically to kill
      // — stops being valid, matching revokeAllSessionsAction's behavior.
      data: { password: passwordHash, sessionVersion: { increment: 1 } },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Link expired or invalid" }, { status: 400 });
  }
}
