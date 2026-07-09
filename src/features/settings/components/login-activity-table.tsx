import { Monitor, KeyRound, UserPlus } from "lucide-react";

type LoginEvent = {
  id: string;
  type: string;
  ip: string | null;
  browser: string | null;
  createdAt: Date;
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const TYPE_LABELS: Record<string, string> = {
  credentials: "Password",
  google: "Google",
  registration: "Registration",
};

const TYPE_STYLE: Record<string, { badge: string; icon: React.ReactNode }> = {
  credentials: {
    badge: "bg-primary/10 text-primary",
    icon: <KeyRound className="h-3 w-3" />,
  },
  google: {
    badge: "bg-muted text-foreground",
    icon: <GoogleIcon />,
  },
  registration: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    icon: <UserPlus className="h-3 w-3" />,
  },
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
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    TYPE_STYLE[e.type]?.badge ?? "bg-muted text-foreground"
                  }`}
                >
                  {TYPE_STYLE[e.type]?.icon}
                  {TYPE_LABELS[e.type] ?? e.type}
                </span>
              </td>
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
