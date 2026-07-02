import { Monitor } from "lucide-react";

type LoginEvent = {
  id: string;
  type: string;
  ip: string | null;
  browser: string | null;
  createdAt: Date;
};

const TYPE_LABELS: Record<string, string> = {
  credentials: "Password",
  google: "Google",
  registration: "Registration",
};

export function LoginActivityTable({ events }: { events: LoginEvent[] }) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No login activity recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">Type</th>
            <th className="pb-2 pr-4">IP</th>
            <th className="pb-2">Browser</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((e) => (
            <tr key={e.id}>
              <td className="py-2.5 pr-4 text-muted-foreground">
                {e.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="py-2.5 pr-4 text-foreground">{TYPE_LABELS[e.type] ?? e.type}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{e.ip ?? "Unknown"}</td>
              <td className="py-2.5 text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5" /> {e.browser ?? "Unknown"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
