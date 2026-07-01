CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
CREATE TABLE "CustomDomain" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "lastChecked" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");
CREATE INDEX "CustomDomain_workspaceId_idx" ON "CustomDomain"("workspaceId");
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;