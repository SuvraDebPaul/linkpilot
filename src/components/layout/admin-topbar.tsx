"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { AdminGlobalSearch } from "@/components/layout/admin-global-search";

export function AdminTopbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-zinc-950 px-4 text-zinc-100 sm:px-6">
      <AdminGlobalSearch />
      <p className="hidden text-sm text-zinc-400 sm:block">
        Signed in as <span className="font-medium text-zinc-100">{session?.user?.email}</span>
      </p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  );
}
