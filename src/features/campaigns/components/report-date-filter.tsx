"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReportDateFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  function apply() {
    const url = new URL(basePath, window.location.origin);
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);
    router.push(url.pathname + url.search);
  }

  function clear() {
    setFrom("");
    setTo("");
    router.push(basePath);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 print:hidden">
      <div>
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-9 w-36" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-9 w-36" />
      </div>
      <Button size="sm" onClick={apply}>Apply</Button>
      {(params.get("from") || params.get("to")) && (
        <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
      )}
    </div>
  );
}
