import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getRecentLoginEvents } from "@/server/queries/security.queries";
import { getUserPlan } from "@/lib/subscription";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { SetPasswordForm } from "@/features/settings/components/set-password-form";
import { SignInMethods } from "@/features/settings/components/sign-in-methods";
import { DangerZone } from "@/features/settings/components/danger-zone";
import { ThemeSwitcher } from "@/features/settings/components/theme-switcher";
import { MonthlyReportToggle } from "@/features/settings/components/monthly-report-toggle";
import { RevokeSessionsButton } from "@/features/settings/components/revoke-sessions-button";
import { LoginActivityTable } from "@/features/settings/components/login-activity-table";
import { PlanBadge } from "@/components/shared/plan-badge";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, loginEvents, plan, workspaceId, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        password: true,
        image: true,
        createdAt: true,
        emailVerified: true,
        monthlyReportEnabled: true,
      },
    }),
    getRecentLoginEvents(session.user.id),
    getUserPlan(session.user.id),
    ensureWorkspace(session.user.id),
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true },
    }),
  ]);
  if (!user) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  const hasPassword = Boolean(user.password);
  const hasGoogle = accounts.some((a) => a.provider === "google");
  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-full space-y-6">
      <PageHeader title="Settings" description="Manage your account details." />

      {/* Profile + Password — compact forms, side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              Update your display name and avatar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <PlanBadge plan={plan} />
              <span>·</span>
              <span>Member since {memberSince}</span>
              {workspace && (
                <>
                  <span>·</span>
                  <span className="truncate">{workspace.name}</span>
                </>
              )}
            </div>
            <ProfileForm
              name={user.name}
              email={user.email!}
              image={user.image}
              emailVerified={!!user.emailVerified}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>
              {hasPassword
                ? "Change your login password."
                : "Set a password to enable email/password sign-in."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInMethods hasGoogle={hasGoogle} hasPassword={hasPassword} />
            {hasPassword ? <PasswordForm /> : <SetPasswordForm />}
          </CardContent>
        </Card>
      </div>

      {/* Security — full width, the activity table needs the room */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>
            Sessions and recent sign-in activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Active sessions
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sign out of this device and every other device you&apos;re
                logged into.
              </p>
            </div>
            <RevokeSessionsButton />
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-medium text-foreground">
              Recent login activity
            </p>
            <LoginActivityTable events={loginEvents} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance (wider — 3 theme options need the room) + Monthly report */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how LinkPilot looks on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly report</CardTitle>
            <CardDescription>
              A summary of your account&apos;s activity, sent once a month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-foreground">
                Receive by email
              </p>
              <MonthlyReportToggle initialEnabled={user.monthlyReportEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone — kept isolated at the bottom for visual weight */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DangerZone />
        </CardContent>
      </Card>
    </div>
  );
}
