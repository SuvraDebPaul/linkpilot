"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDomainAction } from "@/features/domains/actions/domain.actions";

export function AddDomainForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await addDomainAction(fd);
      if (result.error) toast.error(result.error);
      else { toast.success("Domain added. Set the CNAME then verify."); form.reset(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input name="domain" placeholder="links.yourbrand.com" className="max-w-xs" disabled={isPending} required />
      <Button type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add domain"}</Button>
    </form>
  );
}
