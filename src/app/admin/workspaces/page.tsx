import Link from "next/link";
import { Ban } from "lucide-react";
import { getWorkspacesList } from "@/server/queries/admin-workspaces.queries";
import { UserSearchBox } from "@/components/admin/user-search-box";

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { workspaces, total, pageSize } = await getWorkspacesList(q, page ? Number(page) : 1);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Workspaces</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} total</p>

      <div className="mt-4 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Members</th>
              <th className="px-4 py-3 font-medium">Links</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/50">
            {workspaces.map((w) => (
              <tr key={w.id} className="hover:bg-accent">
                <td className="px-4 py-3">
                  <Link href={`/admin/workspaces/${w.id}`} className="block">
                    <p className="font-medium text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.slug}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {w.members[0] ? (
                    <>
                      <p>{w.members[0].user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{w.members[0].user.email}</p>
                    </>
                  ) : (
                    <span className="text-amber-400">No owner</span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">{w._count.members}</td>
                <td className="px-4 py-3 text-foreground">{w._count.links}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {w.suspended && (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                      <Ban className="h-3 w-3" /> Suspended
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {workspaces.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No workspaces found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
