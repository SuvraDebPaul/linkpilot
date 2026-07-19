import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/layout/admin-shell";

// None of the /admin/* pages set their own metadata, so without this they'd
// fall back to the root layout's marketing title in the browser tab.
export const metadata: Metadata = { title: "Admin" };

// proxy.ts already gates /admin/* at the edge — this is the same belt-and-suspenders
// second check the regular dashboard layout does, in case this layout is ever
// rendered through a path proxy.ts's matcher doesn't cover.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isSuperAdmin) redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
