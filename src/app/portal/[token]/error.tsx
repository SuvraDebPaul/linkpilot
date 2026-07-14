"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/layout/route-error";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[client portal error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <RouteError error={error} reset={reset} />
    </div>
  );
}
