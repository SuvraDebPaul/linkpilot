import Link from "next/link";
import { HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqs } from "@/constants/faqs";

export function FaqSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.12),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_30%)]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Everything you may want to know before creating a link."
          description="Clear answers about temporary links, password protection, expiry, QR codes, and future campaign features."
          align="center"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className="border-slate-200"
                  >
                    <AccordionTrigger className="gap-4 py-5 text-left text-base font-semibold text-slate-950 hover:text-primary hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="pb-5 pl-12 text-sm leading-7 text-slate-600 sm:pl-[52px]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-white to-blue-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <HelpCircle className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Still have questions?
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Contact us for campaign link setup, branded short domains,
                  analytics requirements, or agency workflow planning.
                </p>

                <Button asChild className="mt-6 w-full">
                  <Link href="/contact">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact us
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Safe temporary sharing
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Use expiry and password protection when sharing temporary
                      links publicly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
