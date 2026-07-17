import { Briefcase, Building2, User } from "lucide-react";

const personas = [
  {
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Freelancers & Consultants",
    pain: "Sending links to clients but never knowing if they even clicked?",
    value:
      "Track every link you share with clients. Build cleaner campaign reports. Show up as a professional who measures results.",
  },
  {
    icon: Building2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    title: "Small Businesses",
    pain: "Flyers, menus, events, promotions — none of it is trackable.",
    value:
      "Create trackable QR codes for posters, menus, events, and offers. Know exactly what's driving traffic from offline to online.",
  },
  {
    icon: Briefcase,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    title: "Agencies & Marketers",
    pain: "Managing links across multiple campaigns in spreadsheets is a mess.",
    value:
      "Organise all campaign links in one place. Share performance reports with clients directly — no PDF export, no login required.",
  },
];

export function SeoContentSection() {
  return (
    <section className="border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
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
              className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105 ${p.bg}`}
              >
                <p.icon className={`h-5 w-5 ${p.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm font-medium italic text-muted-foreground">
                &ldquo;{p.pain}&rdquo;
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{p.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
