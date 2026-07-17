"use client";

import { useEffect, useState } from "react";

const LOADING_STATES = [
  "Loading...",
  "Fetching data..",
  "Syncing...",
  "Processing..",
  "Optimizing...",
];

export function CoreSpinLoader() {
  const [loadingText, setLoadingText] = useState(LOADING_STATES[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_STATES.length;
      setLoadingText(LOADING_STATES[i]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/5 backdrop-blur-sm">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Base glow */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/15 blur-xl" />

        {/* Outer dashed ring */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full border border-dashed border-primary/30" />

        {/* Main arc */}
        <div
          className="absolute inset-1 animate-[spin_2s_linear_infinite] rounded-full border-2 border-transparent border-t-primary"
          style={{
            boxShadow:
              "0 0 8px color-mix(in oklch, var(--primary) 50%, transparent)",
          }}
        />

        {/* Reverse arc */}
        <div
          className="absolute inset-3 animate-[spin_3s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-primary/70"
          style={{
            boxShadow:
              "0 0 8px color-mix(in oklch, var(--primary) 35%, transparent)",
          }}
        />

        {/* Inner fast ring */}
        <div className="absolute inset-5 animate-[spin_1s_ease-in-out_infinite] rounded-full border border-transparent border-l-foreground/40" />

        {/* Orbital dot */}
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
          <div
            className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
            style={{
              boxShadow:
                "0 0 6px color-mix(in oklch, var(--primary) 80%, transparent)",
            }}
          />
        </div>

        {/* Center core */}
        <div
          className="absolute h-2 w-2 animate-pulse rounded-full bg-primary"
          style={{
            boxShadow:
              "0 0 8px color-mix(in oklch, var(--primary) 60%, transparent)",
          }}
        />
      </div>

      <div className="flex h-8 flex-col items-center justify-center gap-1">
        <span
          key={loadingText}
          className="animate-in fade-in slide-in-from-bottom-2 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground duration-500"
        >
          {loadingText}
        </span>
      </div>
    </div>
  );
}
