"use client";

import { Sun, Moon, MonitorSmartphone, Check } from "lucide-react";
import { useTheme, type Theme } from "@/components/shared/theme-provider";
import { updateThemeAction } from "@/features/settings/actions/settings.actions";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; sub: string; icon: typeof Sun }[] = [
  { value: "light", label: "Always use light theme", sub: "Best for bright environments", icon: Sun },
  { value: "dark", label: "Always use dark theme", sub: "Recommended for dark rooms", icon: Moon },
  { value: "auto", label: "Automatic detection", sub: "Adapts to your device's theme", icon: MonitorSmartphone },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  function handleSelect(value: Theme) {
    setTheme(value);
    updateThemeAction(value);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "relative rounded-xl border p-4 text-center transition-colors",
              active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            )}
          >
            {active && (
              <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <opt.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{opt.sub}</p>
          </button>
        );
      })}
    </div>
  );
}
