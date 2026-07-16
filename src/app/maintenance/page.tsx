import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">We&apos;ll be right back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          LinkPilot is undergoing scheduled maintenance. Please check back shortly.
        </p>
      </div>
    </div>
  );
}
