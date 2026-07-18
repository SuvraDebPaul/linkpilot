import {
  CalendarDays,
  CreditCard,
  Package,
  ShoppingBag,
  Star,
  Utensils,
} from "lucide-react";

const manifest = [
  "QR code included with every short link, free",
  "Download as PNG — print-ready, any size",
  "Destination URL can be updated without changing the QR",
  "Scan counts tracked alongside click analytics",
];

const useCases = [
  {
    icon: Utensils,
    title: "Restaurant menus",
    description:
      "Track how many customers scan your table QR to view the menu.",
    stat: "1,204 scans logged",
  },
  {
    icon: CalendarDays,
    title: "Event registration",
    description:
      "Put a QR on a poster. Know exactly how many people registered via it.",
    stat: "312 scans logged",
  },
  {
    icon: ShoppingBag,
    title: "Promotional offers",
    description:
      "Add a QR to flyers and vouchers. Measure redemption by location.",
    stat: "897 scans logged",
  },
  {
    icon: Package,
    title: "Product packaging",
    description:
      "Link to product pages, manuals, or loyalty programs with tracked QR codes.",
    stat: "2,410 scans logged",
  },
  {
    icon: CreditCard,
    title: "Business cards",
    description:
      "Replace static URLs with a trackable QR that you can update anytime.",
    stat: "156 scans logged",
  },
  {
    icon: Star,
    title: "Shop window notices",
    description:
      "Drive online orders, reviews, or bookings from physical signage.",
    stat: "643 scans logged",
  },
];

export function QrCampaignSection() {
  return (
    <section className="border-b border-border bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              QR campaigns
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Create trackable QR codes for offline campaigns
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Every link you create comes with a downloadable QR code. Put it
              anywhere — menus, posters, packaging, cards. When people scan it,
              you see the data.
            </p>

            <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-muted/50">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  QR MANIFEST
                </span>
                <span className="font-mono text-[10px] tracking-widest text-primary">
                  4 ITEMS
                </span>
              </div>
              <ul className="divide-y divide-border">
                {manifest.map((item, i) => (
                  <li key={item} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/25 font-mono text-[10px] font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: use case grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                className="group relative flex flex-col rounded-2xl border border-border bg-muted/50 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-md"
              >
                <span className="absolute right-4 top-4 font-mono text-[10px] text-muted-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <uc.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                </div>
                <p className="pr-5 text-sm font-semibold text-foreground">
                  {uc.title}
                </p>
                <p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">
                  {uc.description}
                </p>
                <p className="mt-3 border-t border-border pt-2 font-mono text-[10px] tracking-wide text-primary/80">
                  {uc.stat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
