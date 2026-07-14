"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { contactAction } from "@/features/contact/actions/contact.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/form-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [teamSize, setTeamSize] = useState("");
  const [useCase, setUseCase] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await contactAction({
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      teamSize,
      useCase,
      message: formData.get("message"),
    });

    setIsPending(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const errors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(result.fieldErrors)) {
          if (msgs?.[0]) errors[key] = msgs[0];
        }
        setFieldErrors(errors);
      }
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Message received!</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll review your requirements and get back to you within one business day.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => {
          setSubmitted(false);
          setTeamSize("");
          setUseCase("");
        }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            className="mt-2 h-11"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="name" />
        </div>
        <div>
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            className="mt-2 h-11"
            disabled={isPending}
          />
          <FieldError errors={fieldErrors} field="email" />
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company / Agency name</Label>
        <Input
          id="company"
          name="company"
          placeholder="Your company or agency"
          className="mt-2 h-11"
          disabled={isPending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="teamSize">Team size</Label>
          <Select value={teamSize} onValueChange={setTeamSize} disabled={isPending}>
            <SelectTrigger id="teamSize" className="mt-2 h-11 w-full">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">Just me</SelectItem>
              <SelectItem value="2-5">2–5 people</SelectItem>
              <SelectItem value="6-20">6–20 people</SelectItem>
              <SelectItem value="20+">More than 20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="useCase">Primary use case</Label>
          <Select value={useCase} onValueChange={setUseCase} disabled={isPending}>
            <SelectTrigger id="useCase" className="mt-2 h-11 w-full">
              <SelectValue placeholder="What do you need?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agency-plan">Agency plan inquiry</SelectItem>
              <SelectItem value="client-reporting">Client-ready reports</SelectItem>
              <SelectItem value="branded-domains">Branded short links</SelectItem>
              <SelectItem value="team-workspaces">Team workspaces</SelectItem>
              <SelectItem value="campaign-management">Campaign management</SelectItem>
              <SelectItem value="other">Something else</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Tell us more <span className="text-destructive">*</span></Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Describe your workflow, the number of clients you manage, what you need from LinkPilot..."
          className="mt-2 min-h-32 resize-none"
          disabled={isPending}
        />
        <FieldError errors={fieldErrors} field="message" />
      </div>

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send inquiry"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We usually respond within one business day.
      </p>
    </form>
  );
}
