import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      className={cn("h-10 w-10 animate-spin", className)}
      fill="none"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="38 200"
        style={{ stroke: "var(--primary)" }}
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="28 200"
        transform="rotate(150 25 25)"
        style={{ stroke: "#8b5cf6" }}
      />
    </svg>
  );
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
