import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, name: true },
  });

  if (user?.onboardingCompleted) redirect("/dashboard");

  return <OnboardingWizard userName={user?.name ?? null} />;
}
