"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "motion/react";

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(0);

    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref} className={className} />;
}
