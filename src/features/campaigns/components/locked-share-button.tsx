import Link from "next/link";
import { Link2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LockedShareButton() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 cursor-not-allowed opacity-50"
        disabled
        title="Shareable reports are a Pro feature"
      >
        <Lock className="h-3.5 w-3.5" />
        <Link2 className="h-4 w-4" />
        Share report
      </Button>
      <Link
        href="/dashboard/settings/billing"
        className="text-xs font-medium text-primary hover:underline"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
