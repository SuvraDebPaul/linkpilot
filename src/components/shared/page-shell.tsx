import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`relative overflow-hidden bg-muted ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
      </div>

      {children}
    </main>
  );
}
