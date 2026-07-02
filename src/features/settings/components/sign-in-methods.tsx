import { CheckCircle2, Circle } from "lucide-react";

export function SignInMethods({ hasGoogle, hasPassword }: { hasGoogle: boolean; hasPassword: boolean }) {
  const methods = [
    { label: "Google", connected: hasGoogle },
    { label: "Password", connected: hasPassword },
  ];

  return (
    <div className="mb-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
      {methods.map((m) => (
        <div key={m.label} className="flex items-center justify-between text-sm">
          <span className="text-foreground">{m.label}</span>
          {m.connected ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Circle className="h-3.5 w-3.5" /> Not set
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
