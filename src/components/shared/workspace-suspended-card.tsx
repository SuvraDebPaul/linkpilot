"use client";

import { signOut } from "next-auth/react";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceSuspendedCard() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-foreground">This workspace has been suspended</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access to this workspace has been temporarily disabled. Contact support if you believe this is a mistake.
      </p>
      <Button className="mt-6 w-full" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}
