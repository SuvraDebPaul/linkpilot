"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

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

const stats = [
  { stat: "60 sec", label: "to your first tracked link" },
  { stat: "$0", label: "to get started — free forever" },
  { stat: "0", label: "logins your client needs for reports" },
  { stat: "$5/mo", label: "Starter plan — less than a coffee" },
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
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const total = testimonials.length;
  const active = testimonials[index];

  useEffect(() => {
    if (!autoplay || hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(id);
  }, [autoplay, hovered, total]);

  function goTo(next: number) {
    setAutoplay(false);
    setIndex(((next % total) + total) % total);
  }

  return (
    <section className="border-b border-border bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            What people say
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Freelancers and agencies who stopped guessing.
          </h2>
        </div>

        <div className="mt-14">
          <div
            className="flex items-center gap-4"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous testimonial"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="mx-auto min-w-0 flex-1 max-w-3xl overflow-hidden rounded-2xl border border-border bg-muted/30 p-8 shadow-sm sm:p-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  PASSENGER REVIEW
                </span>
                <span className="font-mono text-[10px] tracking-widest text-primary">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>

              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="mt-5">
                  <Stars />
                </div>

                <blockquote className="mt-5 text-lg leading-8 text-foreground/90 sm:text-xl">
                  &ldquo;{active.quote}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${active.color}`}
                    aria-hidden
                  >
                    {active.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {active.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {active.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next testimonial"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show testimonial from ${t.name}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-border hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
