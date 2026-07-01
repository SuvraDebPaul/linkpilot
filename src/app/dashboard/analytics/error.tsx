"use client";

import { RouteError } from "@/components/layout/route-error";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} context="analytics" />;
}
