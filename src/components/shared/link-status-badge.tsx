import { Badge } from "@/components/ui/badge";

export function isLinkExpired(expiresAt: Date | null): boolean {
  return expiresAt ? expiresAt < new Date() : false;
}

export function LinkStatusBadge({
  isActive,
  expiresAt,
}: {
  isActive: boolean;
  expiresAt: Date | null;
}) {
  if (isLinkExpired(expiresAt)) {
    return (
      <Badge variant="secondary" className="bg-destructive/10 text-destructive">
        Expired
      </Badge>
    );
  }
  if (isActive) {
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary">
        Active
      </Badge>
    );
  }
  return <Badge variant="secondary">Inactive</Badge>;
}
