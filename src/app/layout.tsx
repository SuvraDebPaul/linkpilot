import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/shared/session-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("linkpilot-theme") || "auto";
    var isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "LinkPilot — Campaign Link Management",
    template: "%s | LinkPilot",
  },
  description:
    "Short links, trackable QR codes, campaign dashboards, and client-ready reports. Free account includes 50 links, 2 campaigns, and basic analytics.",
  openGraph: {
    siteName: "LinkPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        roboto.variable,
      )}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
