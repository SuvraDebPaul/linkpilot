import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Link Unavailable",
  robots: { index: false, follow: false },
};

export default function LinkUnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Link unavailable</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            This short link does not exist or is no longer available.
          </p>

          <Button asChild>
            <Link href="/">Create a free link</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
