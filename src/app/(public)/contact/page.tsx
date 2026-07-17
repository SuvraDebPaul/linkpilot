import type { Metadata } from "next";
import { Check, Mail, Rocket, Users, BarChart3, Globe2 } from "lucide-react";

import { ContactForm } from "@/features/contact/components/contact-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact — Agency Plan",
  description:
    "Running a marketing agency or managing links for multiple clients? Talk to us about a custom Agency plan with white-label reports, team workspaces, and a dedicated account manager.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact LinkPilot — Agency & Team Plans",
    description:
      "Need client workspaces, white-label reports, or custom limits? Tell us about your agency and we'll set up the right plan.",
    url: `${siteConfig.url}/contact`,
    siteName: "LinkPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact LinkPilot — Agency & Team Plans",
    description:
      "Need client workspaces, white-label reports, or custom limits? Tell us about your agency and we'll set up the right plan.",
  },
};

const agencyIncludes = [
  "Multiple team workspaces",
  "Client management portal",
  "Unlimited links and campaigns",
  "Client-ready shareable reports",
  "Branded custom domains",
  "Dedicated onboarding support",
  "Priority email support",
  "Custom billing and invoicing",
];

const whyContact = [
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Manage multiple clients, separate workspaces, and team-level access controls — all from one account.",
  },
  {
    icon: BarChart3,
    title: "Client-ready reporting",
    description:
      "Share campaign performance with clients via a public link. No login required to view — clean and professional.",
  },
  {
    icon: Globe2,
    title: "Branded short links",
    description:
      "Use your own domain for short links. Every link looks on-brand and builds trust with your audience.",
  },
  {
    icon: Rocket,
    title: "Custom setup",
    description:
      "We'll help you plan the right workspace structure, domain setup, and reporting workflow for your team.",
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Agency plan"
            title="LinkPilot for agencies and teams."
            description="Need campaign tracking, client reports, branded short links, or a custom team setup? Tell us about your use case and we'll get you the right plan."
            align="center"
            headingLevel="h1"
          />
        </div>
      </section>

      {/* Agency plan includes strip */}
      <section className="border-b border-border bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Agency plan includes
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {agencyIncludes.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr]">

          {/* Left — why contact */}
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Why agencies choose LinkPilot</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pricing is custom and scales with your team. Fill in the form and we&apos;ll propose
                a setup that fits your workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {whyContact.map((item) => (
                <Card key={item.title} className="border-border bg-card shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-card to-blue-500/10 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">Prefer to email directly?</p>
                </div>
                <p className="mt-2 text-sm font-medium text-primary">
                  {process.env.CONTACT_EMAIL ?? "hello@linkpilot.app"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">We usually respond within one business day.</p>
              </CardContent>
            </Card>
          </div>

          {/* Right — form */}
          <Card className="border-border bg-card shadow-xl shadow-black/5">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-1 text-lg font-bold text-foreground">Tell us about your team</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                We&apos;ll get back to you with a custom plan and pricing.
              </p>
              <ContactForm />
            </CardContent>
          </Card>

        </div>
      </section>
    </main>
  );
}
