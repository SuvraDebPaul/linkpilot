"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarHighlightContextValue = {
  hovered: string | null;
  setHovered: (href: string | null) => void;
};

const SidebarHighlightContext = createContext<SidebarHighlightContextValue | null>(null);

export function SidebarHighlightProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <SidebarHighlightContext.Provider value={{ hovered, setHovered }}>
      {children}
    </SidebarHighlightContext.Provider>
  );
}

/** Tracks which nav item is currently hovered, so the animated highlight pill
 * (shared via a single Motion layoutId) knows which item to slide to. Falls
 * back to each item's own active state once the pointer leaves the nav. */
export function useSidebarHighlight() {
  const ctx = useContext(SidebarHighlightContext);
  if (!ctx) throw new Error("useSidebarHighlight must be used within SidebarHighlightProvider");
  return ctx;
}
