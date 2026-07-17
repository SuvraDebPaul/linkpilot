"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2, Circle, StickyNote } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { addNoteAction, resolveNoteAction, deleteNoteAction } from "@/features/admin/actions/notes.actions";

type Note = {
  id: string;
  note: string;
  resolved: boolean;
  authorEmail: string | null;
  createdAt: Date;
};

export function NotesPanel({
  targetType,
  targetId,
  notes,
}: {
  targetType: "User" | "Workspace";
  targetId: string;
  notes: Note[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd() {
    if (!draft.trim()) return;
    setIsAdding(true);
    try {
      const result = await addNoteAction(targetType, targetId, draft);
      if (result.success) {
        toast.success(result.message);
        setDraft("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggleResolve(noteId: string, resolved: boolean) {
    const result = await resolveNoteAction(noteId, targetType, targetId, resolved);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDelete(noteId: string) {
    const result = await deleteNoteAction(noteId, targetType, targetId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <StickyNote className="h-4 w-4" />
        Internal notes
      </h2>

      <div className="mt-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leave a note for whoever handles this next…"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          rows={2}
        />
        <Button size="sm" className="mt-2" onClick={handleAdd} disabled={isAdding || !draft.trim()}>
          Add note
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border border-border/50 p-3 text-sm ${n.resolved ? "opacity-50" : ""}`}
            >
              <p className={`text-foreground ${n.resolved ? "line-through" : ""}`}>{n.note}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {n.authorEmail ?? "—"} · {n.createdAt.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-emerald-400"
                    onClick={() => handleToggleResolve(n.id, !n.resolved)}
                    title={n.resolved ? "Reopen" : "Mark resolved"}
                  >
                    {n.resolved ? <Circle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Delete this note?"
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(n.id)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
