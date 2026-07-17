"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function UserSearchBox({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or email…"
        className="border-border bg-card pl-9 text-foreground placeholder:text-muted-foreground"
      />
    </form>
  );
}
