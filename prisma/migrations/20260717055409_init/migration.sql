-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "lifetimeAccess" BOOLEAN NOT NULL DEFAULT false,
    "totalLinksCreated" INTEGER NOT NULL DEFAULT 0,
    "totalCampaignsCreated" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAsWorkspaceMember" BOOLEAN NOT NULL DEFAULT false,
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "monthlyReportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "monthlyReportLastSentAt" TIMESTAMP(3),
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "onboardingDay1SentAt" TIMESTAMP(3),
    "onboardingDay3SentAt" TIMESTAMP(3),
    "onboardingDay7SentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockAttempt" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT,
    "country" TEXT,
    "city" TEXT,
    "browser" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandLogoUrl" TEXT,
    "brandColor" TEXT,
    "hideBranding" BOOLEAN NOT NULL DEFAULT false,
    "slugStyle" TEXT NOT NULL DEFAULT 'random',
    "slugCounter" INTEGER NOT NULL DEFAULT 0,
    "defaultRedirectType" TEXT NOT NULL DEFAULT '302',
    "defaultCloakingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultQrFgColor" TEXT NOT NULL DEFAULT '#000000',
    "defaultQrBgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "defaultQrEcLevel" TEXT NOT NULL DEFAULT 'M',
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronRunLog" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEventLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "reason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "note" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targets" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "term" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "lastChecked" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shareToken" TEXT,
    "reportEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reportEmailFrequency" TEXT,
    "reportEmailRecipients" TEXT[],
    "reportEmailLastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "customDomainId" TEXT,
    "title" TEXT,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isPasswordProtected" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "maxClicks" INTEGER,
    "notes" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "geoTargets" JSONB,
    "abVariants" JSONB,
    "retargetingPixels" JSONB,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isCloaked" BOOLEAN NOT NULL DEFAULT false,
    "hideReferrer" BOOLEAN NOT NULL DEFAULT false,
    "redirectType" TEXT NOT NULL DEFAULT '302',
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "qrFgColor" TEXT NOT NULL DEFAULT '#000000',
    "qrBgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "qrEcLevel" TEXT NOT NULL DEFAULT 'M',
    "qrMargin" INTEGER NOT NULL DEFAULT 2,
    "qrLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkClickEvent" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ipHash" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAccess" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCampaignAccess" (
    "id" TEXT NOT NULL,
    "clientAccessId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "ClientCampaignAccess_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_createdAt_idx" ON "LoginAttempt"("identifier", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ip_createdAt_idx" ON "LoginAttempt"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "UnlockAttempt_slug_ip_createdAt_idx" ON "UnlockAttempt"("slug", "ip", "createdAt");

-- CreateIndex
CREATE INDEX "ImportAttempt_userId_createdAt_idx" ON "ImportAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginEvent_userId_idx" ON "LoginEvent"("userId");

-- CreateIndex
CREATE INDEX "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "WorkspaceAuditLog_workspaceId_idx" ON "WorkspaceAuditLog"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceAuditLog_createdAt_idx" ON "WorkspaceAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorUserId_idx" ON "AdminAuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "CronRunLog_jobName_createdAt_idx" ON "CronRunLog"("jobName", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookEventLog_eventType_createdAt_idx" ON "WebhookEventLog"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookEventLog_status_idx" ON "WebhookEventLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDomain_domain_key" ON "BlockedDomain"("domain");

-- CreateIndex
CREATE INDEX "AdminNote_targetType_targetId_idx" ON "AdminNote"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "GeoTemplate_workspaceId_idx" ON "GeoTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "CampaignTemplate_workspaceId_idx" ON "CampaignTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");

-- CreateIndex
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");

-- CreateIndex
CREATE INDEX "CustomDomain_workspaceId_idx" ON "CustomDomain"("workspaceId");

-- CreateIndex
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_shareToken_key" ON "Campaign"("shareToken");

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- CreateIndex
CREATE INDEX "Campaign_workspaceId_idx" ON "Campaign"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_shortCode_key" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_userId_idx" ON "Link"("userId");

-- CreateIndex
CREATE INDEX "Link_workspaceId_idx" ON "Link"("workspaceId");

-- CreateIndex
CREATE INDEX "Link_campaignId_idx" ON "Link"("campaignId");

-- CreateIndex
CREATE INDEX "Link_customDomainId_idx" ON "Link"("customDomainId");

-- CreateIndex
CREATE INDEX "Link_shortCode_idx" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");

-- CreateIndex
CREATE INDEX "LinkClickEvent_linkId_idx" ON "LinkClickEvent"("linkId");

-- CreateIndex
CREATE INDEX "LinkClickEvent_linkId_ipHash_createdAt_idx" ON "LinkClickEvent"("linkId", "ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "LinkClickEvent_createdAt_idx" ON "LinkClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "LinkClickEvent_device_idx" ON "LinkClickEvent"("device");

-- CreateIndex
CREATE INDEX "LinkClickEvent_country_idx" ON "LinkClickEvent"("country");

-- CreateIndex
CREATE INDEX "LinkClickEvent_utmSource_idx" ON "LinkClickEvent"("utmSource");

-- CreateIndex
CREATE INDEX "LinkClickEvent_utmMedium_idx" ON "LinkClickEvent"("utmMedium");

-- CreateIndex
CREATE INDEX "LinkClickEvent_utmCampaign_idx" ON "LinkClickEvent"("utmCampaign");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccess_token_key" ON "ClientAccess"("token");

-- CreateIndex
CREATE INDEX "ClientAccess_token_idx" ON "ClientAccess"("token");

-- CreateIndex
CREATE INDEX "ClientAccess_createdByUserId_idx" ON "ClientAccess"("createdByUserId");

-- CreateIndex
CREATE INDEX "ClientAccess_workspaceId_idx" ON "ClientAccess"("workspaceId");

-- CreateIndex
CREATE INDEX "ClientCampaignAccess_clientAccessId_idx" ON "ClientCampaignAccess"("clientAccessId");

-- CreateIndex
CREATE INDEX "ClientCampaignAccess_campaignId_idx" ON "ClientCampaignAccess"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCampaignAccess_clientAccessId_campaignId_key" ON "ClientCampaignAccess"("clientAccessId", "campaignId");

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
CREATE INDEX "GuestClickEvent_guestLinkId_ipHash_createdAt_idx" ON "GuestClickEvent"("guestLinkId", "ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "GuestClickEvent_createdAt_idx" ON "GuestClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "GuestClickEvent_ipHash_idx" ON "GuestClickEvent"("ipHash");

-- CreateIndex
CREATE INDEX "GuestClickEvent_device_idx" ON "GuestClickEvent"("device");

-- CreateIndex
CREATE INDEX "GuestClickEvent_country_idx" ON "GuestClickEvent"("country");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAuditLog" ADD CONSTRAINT "WorkspaceAuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoTemplate" ADD CONSTRAINT "GeoTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTemplate" ADD CONSTRAINT "CampaignTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_customDomainId_fkey" FOREIGN KEY ("customDomainId") REFERENCES "CustomDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkClickEvent" ADD CONSTRAINT "LinkClickEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccess" ADD CONSTRAINT "ClientAccess_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccess" ADD CONSTRAINT "ClientAccess_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCampaignAccess" ADD CONSTRAINT "ClientCampaignAccess_clientAccessId_fkey" FOREIGN KEY ("clientAccessId") REFERENCES "ClientAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCampaignAccess" ADD CONSTRAINT "ClientCampaignAccess_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestClickEvent" ADD CONSTRAINT "GuestClickEvent_guestLinkId_fkey" FOREIGN KEY ("guestLinkId") REFERENCES "GuestLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
