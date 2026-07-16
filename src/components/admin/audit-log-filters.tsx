"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuditLogFilters({
  defaultAction,
  defaultTargetType,
}: {
  defaultAction: string;
  defaultTargetType: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [action, setAction] = useState(defaultAction);

  function apply(nextAction: string, nextTargetType: string) {
    const params = new URLSearchParams();
    if (nextAction.trim()) params.set("action", nextAction.trim());
    if (nextTargetType && nextTargetType !== "all") params.set("targetType", nextTargetType);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(action, defaultTargetType);
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter by action, e.g. user.suspend…"
          className="w-72 border-white/10 bg-zinc-950 pl-9 text-zinc-100 placeholder:text-zinc-600"
        />
      </form>
      <Select
        value={defaultTargetType || "all"}
        onValueChange={(v) => apply(action, v)}
      >
        <SelectTrigger className="w-44 border-white/10 bg-zinc-950 text-zinc-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All targets</SelectItem>
          <SelectItem value="User">User</SelectItem>
          <SelectItem value="Workspace">Workspace</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
