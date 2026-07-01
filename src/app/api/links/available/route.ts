import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ links: [] }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  const links = await prisma.link.findMany({
    where: {
      userId: session.user.id,
      OR: [{ campaignId: null }, { campaignId: campaignId ?? undefined }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, shortCode: true },
  });

  return NextResponse.json({ links });
}
