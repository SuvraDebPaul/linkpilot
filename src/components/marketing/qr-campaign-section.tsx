import {
  CalendarDays,
  CreditCard,
  Package,
  ShoppingBag,
  Star,
  Utensils,
} from "lucide-react";

const useCases = [
  {
    icon: Utensils,
    title: "Restaurant menus",
    description: "Track how many customers scan your table QR to view the menu.",
  },
  {
    icon: CalendarDays,
    title: "Event registration",
    description: "Put a QR on a poster. Know exactly how many people registered via it.",
  },
  {
    icon: ShoppingBag,
    title: "Promotional offers",
    description: "Add a QR to flyers and vouchers. Measure redemption by location.",
  },
  {
    icon: Package,
    title: "Product packaging",
    description: "Link to product pages, manuals, or loyalty programs with tracked QR codes.",
  },
  {
    icon: CreditCard,
    title: "Business cards",
    description: "Replace static URLs with a trackable QR that you can update anytime.",
  },
  {
    icon: Star,
    title: "Shop window notices",
    description: "Drive online orders, reviews, or bookings from physical signage.",
  },
];

export function QrCampaignSection() {
  return (
    <section className="border-b border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
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
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                QR code included with every short link, free
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Download as PNG — print-ready, any size
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Destination URL can be updated without changing the QR
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Scan counts tracked alongside click analytics
              </li>
            </ul>
          </div>

          {/* Right: use case grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="group rounded-2xl border border-border bg-muted/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <uc.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">{uc.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
