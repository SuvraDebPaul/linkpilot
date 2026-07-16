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
    <div ref={containerRef} className="relative w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Jump to a user, workspace, or link…"
        className="h-9 w-full rounded-lg border border-white/10 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
          {isPending && !hasResults && (
            <p className="px-3 py-3 text-xs text-zinc-500">Searching…</p>
          )}
          {!isPending && !hasResults && (
            <p className="px-3 py-3 text-xs text-zinc-500">No matches.</p>
          )}

          {results.users.length > 0 && (
            <div className="border-b border-white/5 py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Users</p>
              {results.users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
                >
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{u.name ?? u.email}</span>
                  <span className="truncate text-xs text-zinc-500">{u.email}</span>
                </Link>
              ))}
            </div>
          )}

          {results.workspaces.length > 0 && (
            <div className="border-b border-white/5 py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Workspaces</p>
              {results.workspaces.map((w) => (
                <Link
                  key={w.id}
                  href={`/admin/workspaces/${w.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{w.name}</span>
                  <span className="truncate text-xs text-zinc-500">{w.slug}</span>
                </Link>
              ))}
            </div>
          )}

          {results.links.length > 0 && (
            <div className="py-1.5">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">Links</p>
              {results.links.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/moderation/links?q=${encodeURIComponent(l.shortCode)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <span className="shrink-0 font-mono text-xs">{l.shortCode}</span>
                  <span className="truncate text-xs text-zinc-500">{l.originalUrl}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
