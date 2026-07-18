import { Briefcase, Building2, User } from "lucide-react";

const personas = [
  {
    icon: User,
    group: "A",
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/15",
    topBar: "bg-primary",
    gradient: "from-primary/8",
    quoteBorder: "border-primary/30",
    tag: "border-primary/25 text-primary",
    title: "Freelancers & Consultants",
    pain: "Sending links to clients but never knowing if they even clicked?",
    value:
      "Track every link you share with clients. Build cleaner campaign reports. Show up as a professional who measures results.",
  },
  {
    icon: Building2,
    group: "B",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    ring: "ring-blue-500/15 dark:ring-blue-400/15",
    topBar: "bg-blue-500",
    gradient: "from-blue-500/8 dark:from-blue-400/10",
    quoteBorder: "border-blue-500/30 dark:border-blue-400/30",
    tag: "border-blue-500/25 text-blue-600 dark:border-blue-400/25 dark:text-blue-400",
    title: "Small Businesses",
    pain: "Flyers, menus, events, promotions — none of it is trackable.",
    value:
      "Create trackable QR codes for posters, menus, events, and offers. Know exactly what's driving traffic from offline to online.",
  },
  {
    icon: Briefcase,
    group: "C",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    ring: "ring-violet-500/15 dark:ring-violet-400/15",
    topBar: "bg-violet-500",
    gradient: "from-violet-500/8 dark:from-violet-400/10",
    quoteBorder: "border-violet-500/30 dark:border-violet-400/30",
    tag: "border-violet-500/25 text-violet-600 dark:border-violet-400/25 dark:text-violet-400",
    title: "Agencies & Marketers",
    pain: "Managing links across multiple campaigns in spreadsheets is a mess.",
    value:
      "Organise all campaign links in one place. Share performance reports with clients directly — no PDF export, no login required.",
  },
];

export function SeoContentSection() {
  return (
    <section className="border-b border-border bg-background/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Who it&apos;s for
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for the way you work
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Whether you&apos;re a solo freelancer, a local business, or a
            marketing team — if you share links as part of your work, LinkPilot
            makes those links count.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {personas.map((p) => (
            <div
              key={p.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${p.gradient} to-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 ${p.topBar}`}
                aria-hidden
              />

              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition duration-300 group-hover:scale-105 ${p.bg} ${p.ring}`}
                >
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                </div>

                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest ${p.tag}`}
                >
                  GROUP {p.group}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-foreground">
                {p.title}
              </h3>

              <blockquote
                className={`mt-3 border-l-2 pl-3 text-sm font-medium italic leading-6 text-muted-foreground ${p.quoteBorder}`}
              >
                &ldquo;{p.pain}&rdquo;
              </blockquote>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {p.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
