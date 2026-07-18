import { PlaneTakeoff, QrCode } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function GuestLinkTicketPlaceholder() {
  return (
    <Card className="h-full border-dashed border-border bg-muted/40 shadow-none">
      <CardContent className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
          <PlaneTakeoff className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Your boarding pass will print here
          </p>
          <p className="mt-1.5 max-w-56 text-xs leading-5 text-muted-foreground">
            Paste a URL and submit — your short link and QR code will appear in
            this space.
          </p>
        </div>

        <div className="w-full max-w-56 rounded-xl border border-dashed border-border p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Short URL
          </p>
          <div className="h-8 w-full rounded-lg border border-dashed border-border bg-background/40" />

          <div className="my-4 flex items-center gap-2">
            <span className="h-px flex-1 border-t border-dashed border-border" />
            <span className="h-2 w-2 rounded-full border border-dashed border-border" />
            <span className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground/50">
            <QrCode className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
