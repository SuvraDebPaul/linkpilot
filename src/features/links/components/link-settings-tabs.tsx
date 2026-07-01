"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

const TABS: Tab[] = [
  { id: "edit",       label: "Edit" },
  { id: "targeting",  label: "Targeting" },
  { id: "advanced",   label: "Advanced" },
];

type Props = {
  editContent:      React.ReactNode;
  targetingContent: React.ReactNode;
  advancedContent:  React.ReactNode;
};

export function LinkSettingsTabs({ editContent, targetingContent, advancedContent }: Props) {
  const [active, setActive] = useState("edit");

  const content: Record<string, React.ReactNode> = {
    edit:      editContent,
    targeting: targetingContent,
    advanced:  advancedContent,
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors",
              active === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 space-y-4">
        {content[active]}
      </div>
    </div>
  );
}
