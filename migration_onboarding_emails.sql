-- Onboarding email sequence tracking fields
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "onboardingDay1SentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "onboardingDay3SentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "onboardingDay7SentAt" TIMESTAMP(3);

-- Index to speed up the daily cron query
CREATE INDEX IF NOT EXISTS "User_onboarding_idx"
  ON "User" ("createdAt", "onboardingDay1SentAt", "onboardingDay3SentAt", "onboardingDay7SentAt");
