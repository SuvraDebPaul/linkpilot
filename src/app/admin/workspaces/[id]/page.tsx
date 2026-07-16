import { notFound } from "next/navigation";
import { getWorkspaceDetail } from "@/server/queries/admin-workspaces.queries";
import { getNotes } from "@/server/queries/admin-notes.queries";
import { WorkspaceActionsPanel } from "@/components/admin/workspace-actions-panel";
import { NotesPanel } from "@/components/admin/notes-panel";

export default async function AdminWorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [workspace, notes] = await Promise.all([getWorkspaceDetail(id), getNotes("Workspace", id)]);
  if (!workspace) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{workspace.name}</h1>
          <p className="text-sm text-zinc-500">{workspace.slug}</p>
        </div>
        {workspace.suspended && (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
            Suspended
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-zinc-500">Created</p>
          <p className="mt-1 text-zinc-200">{workspace.createdAt.toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Links</p>
          <p className="mt-1 text-zinc-200">{workspace._count.links}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Campaigns</p>
          <p className="mt-1 text-zinc-200">{workspace._count.campaigns}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Custom domains</p>
          <p className="mt-1 text-zinc-200">{workspace._count.customDomains}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">Members</h2>
        {workspace.members.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No members.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {workspace.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-200">{m.user.name ?? m.user.email}</span>
                  <span className="ml-2 text-xs text-zinc-500">{m.user.email}</span>
                </div>
                <span className="text-xs text-zinc-500">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NotesPanel targetType="Workspace" targetId={workspace.id} notes={notes} />

      <WorkspaceActionsPanel
        workspaceId={workspace.id}
        slug={workspace.slug}
        suspended={workspace.suspended}
        members={workspace.members.map((m) => ({
          userId: m.user.id,
          label: `${m.user.name ?? m.user.email} (${m.role})`,
        }))}
      />
    </div>
  );
}
