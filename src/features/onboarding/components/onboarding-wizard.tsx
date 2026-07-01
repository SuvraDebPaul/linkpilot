"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Image as ImageIcon, Check, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/features/onboarding/actions/onboarding.actions";

const STEPS = [
  { id: 1, label: "Workspace" },
  { id: 2, label: "Branding" },
  { id: 3, label: "Ready" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function OnboardingWizard({ userName }: { userName: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Step 1
  const [workspaceName, setWorkspaceName] = useState("");
  const [nameError, setNameError] = useState("");

  // Step 2
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#0d9488");
  const [logoError, setLogoError] = useState("");

  function handleStep1() {
    if (!workspaceName.trim()) {
      setNameError("Workspace name is required.");
      return;
    }
    setNameError("");
    setStep(2);
  }

  function handleStep2() {
    if (brandLogoUrl && !brandLogoUrl.startsWith("http")) {
      setLogoError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setLogoError("");
    setStep(3);
  }

  function handleFinish() {
    startTransition(async () => {
      await completeOnboardingAction({
        workspaceName: workspaceName.trim(),
        brandLogoUrl:  brandLogoUrl  || undefined,
        brandColor:    HEX_RE.test(brandColor) ? brandColor : undefined,
      });
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top bar */}
      <header className="flex h-16 items-center border-b border-border bg-background px-6">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    step > s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : step === s.id
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground",
                  )}>
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    step === s.id ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "mb-5 h-0.5 w-16 transition-colors",
                    step > s.id ? "bg-primary" : "bg-border",
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">

            {/* ── Step 1: Workspace name ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="mt-4 text-2xl font-bold text-foreground">
                    {userName ? `Welcome, ${userName.split(" ")[0]}!` : "Welcome!"}
                  </h1>
                  <p className="text-muted-foreground">
                    Let&apos;s set up your workspace. This is how you and your team will identify this account.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="workspaceName">Workspace name <span className="text-destructive">*</span></Label>
                  <Input
                    id="workspaceName"
                    value={workspaceName}
                    onChange={(e) => { setWorkspaceName(e.target.value); setNameError(""); }}
                    placeholder="e.g. Acme Marketing Agency"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                    autoFocus
                  />
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>

                <Button onClick={handleStep1} className="w-full gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ── Step 2: Branding ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="mt-4 text-2xl font-bold text-foreground">Add your brand</h1>
                  <p className="text-muted-foreground">
                    Optional — your logo and color appear on QR codes, client portals, and campaign reports.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="brandLogoUrl">Logo URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input
                      id="brandLogoUrl"
                      value={brandLogoUrl}
                      onChange={(e) => { setBrandLogoUrl(e.target.value); setLogoError(""); }}
                      placeholder="https://yoursite.com/logo.png"
                    />
                    {logoError && <p className="text-xs text-destructive">{logoError}</p>}
                    <p className="text-xs text-muted-foreground">PNG, SVG, or WebP recommended</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Brand color <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-card p-0.5"
                      />
                      <Input
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#0d9488"
                        className="font-mono"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Live preview */}
                  {(brandLogoUrl || brandColor) && (
                    <div
                      className="flex items-center gap-3 rounded-xl p-4"
                      style={{ backgroundColor: `${brandColor}15` }}
                    >
                      {brandLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brandLogoUrl}
                          alt="logo preview"
                          className="h-10 w-10 rounded-md object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: brandColor }}>
                          <span className="text-xs font-bold text-white">
                            {workspaceName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{workspaceName}</p>
                        <p className="text-xs text-muted-foreground">Preview</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 gap-2" onClick={handleStep2}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Done ── */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">You&apos;re all set!</h1>
                    <p className="mt-2 text-muted-foreground">
                      <span className="font-semibold text-foreground">{workspaceName}</span> is ready to go.
                      Start creating short links, QR codes, and campaigns.
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Workspace</span>
                    <span className="font-medium text-foreground">{workspaceName}</span>
                  </div>
                  {brandLogoUrl && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Logo</span>
                      <span className="font-medium text-foreground truncate max-w-[200px]">{brandLogoUrl}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Brand color</span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded border border-border" style={{ backgroundColor: brandColor }} />
                      <span className="font-mono text-foreground">{brandColor}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1 gap-2" onClick={handleFinish} disabled={isPending}>
                    {isPending ? "Setting up…" : <>Go to Dashboard <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can change these settings anytime in{" "}
            <span className="underline underline-offset-2">Settings → Workspace</span>
          </p>
        </div>
      </main>
    </div>
  );
}
