"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Users, Building2, Link2 } from "lucide-react";
import { globalSearchAction, type GlobalSearchResult } from "@/features/admin/actions/global-search.actions";

const EMPTY: GlobalSearchResult = { users: [], workspaces: [], links: [] };

export function AdminGlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stale results from a previous longer query simply won't render while
    // query is under 2 chars (the dropdown itself gates on that length), so
    // there's no need to also clear state here for a short query.
    if (query.trim().length < 2) return;

    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearchAction(query);
        setResults(data);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results.users.length + results.workspaces.length + results.links.length > 0;

  return (
    <div ref={containerRef} className="relative hidden w-72 sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Jump to a user, workspace, or link…"
        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
          {isPending && !hasResults && (
            <p className="px-3 py-3 text-xs text-muted-foreground">Searching…</p>
          )}
          {!isPending && !hasResults && (
            <p className="px-3 py-3 text-xs text-muted-foreground">No matches.</p>
          )}

          {results.users.length > 0 && (
            <div className="border-b border-border/50 py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Users</p>
              {results.users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                >
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{u.name ?? u.email}</span>
                  <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                </Link>
              ))}
            </div>
          )}

          {results.workspaces.length > 0 && (
            <div className="border-b border-border/50 py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Workspaces</p>
              {results.workspaces.map((w) => (
                <Link
                  key={w.id}
                  href={`/admin/workspaces/${w.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{w.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{w.slug}</span>
                </Link>
              ))}
            </div>
          )}

          {results.links.length > 0 && (
            <div className="py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
              {results.links.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/moderation/links?q=${encodeURIComponent(l.shortCode)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="shrink-0 font-mono text-xs">{l.shortCode}</span>
                  <span className="truncate text-xs text-muted-foreground">{l.originalUrl}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
