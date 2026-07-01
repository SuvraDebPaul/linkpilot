"use client";

import { useState } from "react";
import { Copy, Check, Trash2, ExternalLink, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

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
    if (!confirm("Remove this client portal? They will lose access immediately.")) return;
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
      {items.map((item) => {
        const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${item.token}`;
        return (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {item.clientName ?? item.clientEmail}
              </p>
              {item.clientName && (
                <p className="text-xs text-muted-foreground">{item.clientEmail}</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.campaigns.length} campaign{item.campaigns.length !== 1 ? "s" : ""} ·{" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
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

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                title="Delete portal"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
