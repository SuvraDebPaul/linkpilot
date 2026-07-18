"use client";

import { useState } from "react";

import {
  GuestLinkForm,
  GuestLinkResult,
  GuestLinkTicketPlaceholder,
} from "@/features/guest-links";
import type { CreateGuestLinkResponse } from "@/features/guest-links/types/guest-link.types";

export function GuestShortenerSection() {
  const [result, setResult] = useState<NonNullable<
    CreateGuestLinkResponse["data"]
  > | null>(null);

  return (
    <section className="bg-muted/20 border-b border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="pb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Try it now
          </p>
          <h2 className="pt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            No account needed for your first flight.
          </h2>
          <p className="pt-3 text-sm leading-6 text-muted-foreground">
            Create a temporary short link right now — expiry, optional password,
            and a QR code included. Sign up when you want it permanent.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <GuestLinkForm onResult={setResult} />
          {result ? (
            <GuestLinkResult result={result} />
          ) : (
            <GuestLinkTicketPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}
