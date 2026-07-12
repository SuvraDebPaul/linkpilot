"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { LayoutDashboard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

export function DemoDashboardButton({
  variant = "outline",
  size = "lg",
  className,
  label = "View demo dashboard",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
}) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  // A real signed-in user shouldn't be able to demote themselves into the demo
  // account from a marketing page — only show this to signed-out visitors.
  if (status !== "unauthenticated") return null;

  async function handleClick() {
    setLoading(true);
    await signIn("demo", { callbackUrl: "/dashboard" });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LayoutDashboard className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
