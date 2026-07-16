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
  "blocklist.add",
  "link.disable",
  "flag.disable",
  "note.delete",
]);

// Used both to color-code /admin/audit-log entries and to decide which
// actions require typed confirmation (see TypedConfirmDialog) rather than a
// plain click-to-confirm dialog.
export function getAuditSeverity(action: string): AuditSeverity {
  if (DESTRUCTIVE_ACTIONS.has(action)) return "destructive";
  if (HIGH_ACTIONS.has(action)) return "high";
  return "normal";
}
