"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/layout/route-error";

export default function UnlockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[unlock page error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <RouteError error={error} reset={reset} />
    </div>
  );
}
