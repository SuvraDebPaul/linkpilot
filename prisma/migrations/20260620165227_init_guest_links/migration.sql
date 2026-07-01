-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "GuestLink" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isPasswordProtected" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deleteAfter" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creatorIpHash" TEXT,
    "creatorUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestClickEvent" (
    "id" TEXT NOT NULL,
    "guestLinkId" TEXT NOT NULL,
    "ipHash" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestLink_shortCode_key" ON "GuestLink"("shortCode");

-- CreateIndex
CREATE INDEX "GuestLink_shortCode_idx" ON "GuestLink"("shortCode");

-- CreateIndex
CREATE INDEX "GuestLink_expiresAt_idx" ON "GuestLink"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestLink_deleteAfter_idx" ON "GuestLink"("deleteAfter");

-- CreateIndex
CREATE INDEX "GuestLink_creatorIpHash_idx" ON "GuestLink"("creatorIpHash");

-- CreateIndex
CREATE INDEX "GuestLink_createdAt_idx" ON "GuestLink"("createdAt");

-- CreateIndex
CREATE INDEX "GuestClickEvent_guestLinkId_idx" ON "GuestClickEvent"("guestLinkId");

-- CreateIndex
CREATE INDEX "GuestClickEvent_createdAt_idx" ON "GuestClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "GuestClickEvent_ipHash_idx" ON "GuestClickEvent"("ipHash");

-- CreateIndex
CREATE INDEX "GuestClickEvent_device_idx" ON "GuestClickEvent"("device");

-- CreateIndex
CREATE INDEX "GuestClickEvent_country_idx" ON "GuestClickEvent"("country");

-- AddForeignKey
ALTER TABLE "GuestClickEvent" ADD CONSTRAINT "GuestClickEvent_guestLinkId_fkey" FOREIGN KEY ("guestLinkId") REFERENCES "GuestLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
