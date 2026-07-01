-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "shareToken" TEXT;
CREATE UNIQUE INDEX "Campaign_shareToken_key" ON "Campaign"("shareToken");