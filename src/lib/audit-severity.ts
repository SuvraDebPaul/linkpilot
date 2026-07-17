export type AuditSeverity = "destructive" | "high" | "normal";

const DESTRUCTIVE_ACTIONS = new Set([
  "user.delete",
  "workspace.delete",
  "billing.refund",
  "billing.cancel_subscription",
]);

const HIGH_ACTIONS = new Set([
  "user.suspend",
  "workspace.suspend",
  "workspace.transfer_ownership",
  "blocklist.add",
  "link.disable",
  // Both directions of a generic flag are "high" (unlike link/user/workspace
  // suspension, where we know which direction is the disruptive one) since a
  // flag's real-world meaning — and which state is "safe" — is arbitrary.
  "flag.enable",
  "flag.disable",
  "user.grant_plan",
  "user.impersonate_start",
  "user.impersonate_end",
  "user.revoke_session",
]);

// Used both to color-code /admin/audit-log entries and to decide which
// actions require typed confirmation (see TypedConfirmDialog) rather than a
// plain click-to-confirm dialog.
export function getAuditSeverity(action: string): AuditSeverity {
  if (DESTRUCTIVE_ACTIONS.has(action)) return "destructive";
  if (HIGH_ACTIONS.has(action)) return "high";
  return "normal";
}
