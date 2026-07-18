import { CheckCircle2 } from "lucide-react";

import styles from "./trust-bar.module.css";

const signals = [
  "No credit card to start",
  "60 seconds to your first link",
  "Client reports need no login",
  "HTTPS on every link",
  "Links never expire on paid plans",
];

export function TrustBar() {
  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-border bg-background py-3.5">
      <div className={styles.marquee}>
        {[...signals, ...signals].map((text, i) => (
          <span
            key={i}
            className="mx-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
