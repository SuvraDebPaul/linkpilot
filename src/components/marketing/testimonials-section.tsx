import { Star } from "lucide-react";

// TODO: Replace placeholder quotes with verified customer testimonials before launch.
const testimonials = [
  {
    quote:
      "I used to send clients a Google Analytics screenshot every month. Now I send them a link and they see everything live. My clients ask fewer questions and I look like a pro who actually measures results.",
    name: "Sarah K.",
    role: "Freelance Marketing Consultant",
    initial: "S",
    color: "bg-primary",
  },
  {
    quote:
      "We put QR codes on all our in-store flyers and menus. For the first time we can see how many people actually scan them, which product gets interest, and which day is busiest. Worth every cent.",
    name: "Marcus T.",
    role: "Independent Coffee Shop Owner",
    initial: "M",
    color: "bg-blue-500",
  },
  {
    quote:
      "We run campaigns across Instagram, email, and paid ads for every client. Grouping everything into LinkPilot campaigns means we show exactly which channel drove results. Clients love seeing the data.",
    name: "Priya D.",
    role: "Digital Agency Director",
    initial: "P",
    color: "bg-violet-500",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="border-b border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            What people say
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Freelancers and agencies who stopped guessing.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, initial, color }) => (
            <figure
              key={name}
              className="flex flex-col rounded-2xl border border-border bg-muted/30 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
            >
              <Stars />
              <blockquote className="mt-5 flex-1">
                <p className="text-sm leading-7 text-foreground/80">&ldquo;{quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
                  aria-hidden
                >
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Stat strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-muted/30 p-8 sm:grid-cols-4">
          {[
            { stat: "60 sec", label: "to your first tracked link" },
            { stat: "$0",     label: "to get started — free forever" },
            { stat: "0",      label: "logins your client needs for reports" },
            { stat: "$5/mo",  label: "Starter plan — less than a coffee" },
          ].map(({ stat, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black tracking-tight text-foreground">{stat}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
