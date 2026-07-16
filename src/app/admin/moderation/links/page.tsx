import { getLinksList } from "@/server/queries/admin-moderation.queries";
import { UserSearchBox } from "@/components/admin/user-search-box";
import { LinkActiveToggle } from "@/components/admin/link-active-toggle";

export default async function AdminLinksModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { links, total, pageSize } = await getLinksList(q, page ? Number(page) : 1);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">Links</h1>
      <p className="mt-1 text-sm text-zinc-500">{total} total, across every workspace</p>

      <div className="mt-4 max-w-sm">
        <UserSearchBox defaultValue={q ?? ""} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Short code</th>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-zinc-900/50">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-4 py-3 font-mono text-xs text-zinc-100">{link.shortCode}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-400" title={link.originalUrl}>
                  {link.originalUrl}
                </td>
                <td className="px-4 py-3 text-zinc-400">{link.workspace.name}</td>
                <td className="px-4 py-3 text-zinc-500">{link.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {link.isActive ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-amber-400">Disabled</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LinkActiveToggle linkId={link.id} isActive={link.isActive} />
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No links found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          Page {page ? Number(page) : 1} of {Math.ceil(total / pageSize)}
        </div>
      )}
    </div>
  );
}
