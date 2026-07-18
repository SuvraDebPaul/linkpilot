import type { Metadata } from "next";

import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { GuestShortenerSection } from "@/components/marketing/guest-shortener-section";
import { HomePricingSection } from "@/components/marketing/home-pricing-section";
import { PublicHero } from "@/components/marketing/public-hero";
import { QrCampaignSection } from "@/components/marketing/qr-campaign-section";
import { ReportsSection } from "@/components/marketing/reports-section";
import { SeoContentSection } from "@/components/marketing/seo-content-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { siteConfig } from "@/config/site";
import { faqs } from "@/constants/faqs";

export const metadata: Metadata = {
  title: "LinkPilot — Turn Every Shared Link into a Trackable Campaign Asset",
  description:
    "Create short links, trackable QR codes, and client-ready campaign reports. Built for freelancers, small businesses, and marketing teams.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "LinkPilot — Campaign Link Management",
    description:
      "Create short links, trackable QR codes, and client-ready campaign reports from one simple dashboard.",
    url: siteConfig.url,
    siteName: "LinkPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkPilot — Campaign Link Management",
    description:
      "Create short links, trackable QR codes, and client-ready campaign reports from one simple dashboard.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "LinkPilot",
      url: siteConfig.url,
      description: siteConfig.description,
    },
    {
      "@type": "SoftwareApplication",
      name: "LinkPilot",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Campaign link management platform for freelancers, small businesses, and marketers. Create short links, trackable QR codes, and client-ready reports.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero — flight-control value proposition */}
      <PublicHero />
      {/* 2. Guest shortener — the actual free, no-signup tool */}
      <GuestShortenerSection />
      {/* 3. Trust bar — quick-scan reassurance signals */}
      <TrustBar />
      {/* 3. Who it's for — 3 buyer types */}
      <SeoContentSection />
      {/* 4. QR campaigns — offline use cases */}
      <QrCampaignSection />
      {/* 5. Reports — the premium hook */}
      <ReportsSection />
      {/* 6. Testimonials + stat strip */}
      <TestimonialsSection />
      {/* 7. Pricing tease */}
      <HomePricingSection />
      {/* 8. FAQ */}
      <FaqSection />
      {/* 9. Final CTA */}
      <FinalCta />
    </>
  );
}
