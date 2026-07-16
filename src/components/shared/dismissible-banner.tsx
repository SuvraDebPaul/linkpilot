"use client";

import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";

const STORAGE_KEY = "linkpilot-dismissed-announcement";

export function DismissibleBanner({ message }: { message: string }) {
  // Re-showing after the message text changes (not just "ever dismissed
  // once") means editing the banner in /admin/config reaches everyone again,
  // instead of being silently suppressed by an old dismissal.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Reading localStorage can only happen client-side, so syncing it into state here
    // (rather than in the initializer) is what keeps server/client hydration matching —
    // this is the documented "sync from an external system on mount" exception, not the
    // cascading-render pattern the lint rule is otherwise right to flag.
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === message;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (wasDismissed !== dismissed) setDismissed(wasDismissed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, message);
    setDismissed(true);
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
      <Megaphone className="h-4 w-4 shrink-0" />
      <span>{message}</span>
      <button onClick={handleDismiss} className="ml-2 shrink-0 rounded p-0.5 hover:bg-white/20" aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
