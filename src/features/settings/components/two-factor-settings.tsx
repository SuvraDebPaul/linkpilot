"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Copy, Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  startTwoFactorSetupAction,
  confirmTwoFactorAction,
  disableTwoFactorAction,
} from "@/features/settings/actions/security.actions";

type Step = "idle" | "setup" | "backup-codes" | "disabling";

export function TwoFactorSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function startSetup() {
    setPending(true);
    const result = await startTwoFactorSetupAction();
    setPending(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setSecret(result.secret);
    setQrDataUrl(result.qrDataUrl);
    setStep("setup");
  }

  async function confirmSetup() {
    setPending(true);
    const result = await confirmTwoFactorAction(secret, code);
    setPending(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setBackupCodes(result.backupCodes);
    setStep("backup-codes");
    setEnabled(true);
    setCode("");
  }

  async function handleDisable() {
    setPending(true);
    const result = await disableTwoFactorAction(disableCode);
    setPending(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEnabled(false);
    setDisableCode("");
    setStep("idle");
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "backup-codes") {
    return (
      <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <KeyRound className="h-4 w-4 text-primary" /> Save your backup codes
        </p>
        <p className="text-xs text-muted-foreground">
          Each code can be used once if you lose access to your authenticator app. Store them somewhere safe —
          they won&apos;t be shown again.
        </p>
        <div className="grid grid-cols-2 gap-1.5 rounded-md bg-card p-3 font-mono text-xs">
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyBackupCodes} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy codes"}
          </Button>
          <Button size="sm" onClick={() => setStep("idle")}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-foreground">Scan this QR code with your authenticator app</p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Two-factor authentication QR code" className="h-40 w-40 rounded-md border border-border" />
        )}
        <p className="text-xs text-muted-foreground">
          Or enter this key manually: <span className="font-mono">{secret}</span>
        </p>
        <div className="max-w-xs space-y-1.5">
          <Label className="text-xs">Enter the 6-digit code to confirm</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="font-mono"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep("idle")}>
            Cancel
          </Button>
          <Button size="sm" onClick={confirmSetup} disabled={pending || code.length !== 6}>
            {pending ? "Verifying…" : "Enable 2FA"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "disabling") {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-foreground">Disable two-factor authentication?</p>
        <p className="text-xs text-muted-foreground">Enter your current 6-digit code or a backup code to confirm.</p>
        <Input
          value={disableCode}
          onChange={(e) => setDisableCode(e.target.value)}
          placeholder="123456"
          className="max-w-xs font-mono"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setStep("idle"); setDisableCode(""); }}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDisable} disabled={pending || !disableCode.trim()}>
            {pending ? "Disabling…" : "Disable"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          {enabled ? <ShieldCheck className="h-4 w-4 text-primary" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
          Two-factor authentication
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {enabled
            ? "Enabled — an authenticator code is required at sign-in."
            : "Add an extra layer of security using an authenticator app."}
        </p>
      </div>

      {enabled ? (
        <Button variant="outline" size="sm" onClick={() => setStep("disabling")}>
          Disable
        </Button>
      ) : (
        <Button size="sm" onClick={startSetup} disabled={pending}>
          {pending ? "Loading…" : "Enable"}
        </Button>
      )}
    </div>
  );
}
