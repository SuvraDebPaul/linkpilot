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
    <section
      id="faq"
      className="relative scroll-mt-24 overflow-hidden bg-muted/30 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.12),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_30%)] dark:opacity-40" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Everything you may want to know before creating a link."
          description="Clear answers about temporary links, password protection, expiry, QR codes, and future campaign features."
          align="center"
        />

        <div className="mt-12">
          <Card className="border-border bg-card shadow-xl shadow-black/5">
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className="border-border"
                  >
                    <AccordionTrigger className="group -mx-3 gap-4 rounded-xl px-3 py-5 text-left text-base font-semibold text-foreground transition hover:bg-accent/40 hover:text-primary hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary transition group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="pb-5 pl-12 text-sm leading-7 text-muted-foreground sm:pl-13">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
