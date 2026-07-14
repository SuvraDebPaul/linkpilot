"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/layout/route-error";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public error]", error);
  }, [error]);

  return <RouteError error={error} reset={reset} />;
}
