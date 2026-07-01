import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Link Expired",
  robots: { index: false, follow: false },
};

export default function LinkExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>This link has expired</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            The temporary short link is no longer active.
          </p>

          <Button asChild>
            <Link href="/">Create a new link</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
