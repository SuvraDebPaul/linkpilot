"use client";

import { useState } from "react";
import { Copy, Check, Trash2, ExternalLink, Users, FolderKanban, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteClientAccessAction } from "@/features/clients/actions/client-access.actions";

type ClientAccess = {
  id: string;
  token: string;
  clientName: string | null;
  clientEmail: string;
  createdAt: Date;
  campaigns: { campaign: { id: string; name: string; shareToken: string | null } }[];
};

interface Props {
  items: ClientAccess[];
}

const AVATAR_ACCENTS = [
  "bg-teal-500/10 text-teal-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
  "bg-sky-500/10 text-sky-600",
  "bg-rose-500/10 text-rose-600",
  "bg-emerald-500/10 text-emerald-600",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClientList({ items }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/portal/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteClientAccessAction(id);
    setDeleting(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No client portals yet"
        description="Create a portal to give clients a private view of their campaign reports."
      />
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => {
        const label = item.clientName ?? item.clientEmail;
        const accent = AVATAR_ACCENTS[i % AVATAR_ACCENTS.length];
        return (
          <div key={item.id} className="flex items-start gap-3.5 py-4">
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${accent}`}
            >
              {initials(label)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{label}</p>
              {item.clientName && (
                <p className="text-xs text-muted-foreground">{item.clientEmail}</p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {item.campaigns.slice(0, 3).map(({ campaign }) => (
                  <span
                    key={campaign.id}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                  >
                    <FolderKanban className="h-2.5 w-2.5" /> {campaign.name}
                  </span>
                ))}
                {item.campaigns.length > 3 && (
                  <span className="text-[11px] font-medium text-muted-foreground">
                    +{item.campaigns.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Added {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={`/portal/${item.token}`} target="_blank" rel="noopener noreferrer" title="Preview portal">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyLink(item.token)}
                title="Copy portal link"
              >
                {copied === item.token
                  ? <Check className="h-3.5 w-3.5 text-green-500" />
                  : <Copy className="h-3.5 w-3.5" />}
              </Button>

              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={deleting === item.id}
                    title="Delete portal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                }
                title="Remove client portal?"
                description="They will lose access immediately. This cannot be undone."
                confirmLabel="Remove"
                onConfirm={() => handleDelete(item.id)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
