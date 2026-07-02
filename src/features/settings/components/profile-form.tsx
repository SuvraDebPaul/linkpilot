"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, BadgeAlert } from "lucide-react";
import { updateProfileAction, resendVerificationEmailAction } from "@/features/settings/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/image-uploader";

type Props = {
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
};

export function ProfileForm({ name, email, image, emailVerified }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [imageUrl, setImageUrl] = useState(image ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateProfileAction({ name: fd.get("name"), image: imageUrl });
    setIsPending(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  async function handleResend() {
    setIsResending(true);
    const result = await resendVerificationEmailAction();
    setIsResending(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Avatar</Label>
        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          folder="avatars"
          shape="circle"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={name ?? ""} disabled={isPending} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="flex items-center gap-2">
          <Input id="email" value={email} disabled readOnly className="bg-muted/50 text-muted-foreground" />
          {emailVerified ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <BadgeAlert className="h-3.5 w-3.5" /> Not verified
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Email cannot be changed.
          {!emailVerified && (
            <>
              {" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending…" : "Resend verification email"}
              </button>
            </>
          )}
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
