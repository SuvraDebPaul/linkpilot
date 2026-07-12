"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "auto";

const STORAGE_KEY = "linkpilot-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({
  initialTheme = "auto",
  children,
}: {
  initialTheme?: Theme;
  children: React.ReactNode;
}) {
  // Start from initialTheme on both server and the first client render so
  // hydration output matches exactly — the real stored value (if any) is
  // picked up a moment later in the effect below, once we're client-only.
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    // Reading localStorage can only happen client-side, so syncing it into state here
    // (rather than in the initializer) is what keeps server/client hydration matching —
    // this is the documented "sync from an external system on mount" exception, not the
    // cascading-render pattern the lint rule is otherwise right to flag.
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && stored !== theme) setThemeState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
