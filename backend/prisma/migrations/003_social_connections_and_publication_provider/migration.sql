DO $$ BEGIN
  CREATE TYPE "SocialConnectionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED',
    'ERROR',
    'DISCONNECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SocialAccountType" AS ENUM (
    'MEMBER',
    'ORGANIZATION',
    'PAGE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "SocialConnection" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "platform" "PublicationPlatform" NOT NULL,
  "accountType" "SocialAccountType" NOT NULL,
  "accountId" TEXT NOT NULL,
  "accountUrn" TEXT,
  "accountName" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scopes" JSONB,
  "metadata" JSONB,
  "status" "SocialConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "SocialConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialConnection_userId_platform_accountId_key"
  ON "SocialConnection"("userId", "platform", "accountId");
CREATE INDEX IF NOT EXISTS "SocialConnection_userId_platform_status_idx"
  ON "SocialConnection"("userId", "platform", "status");

ALTER TABLE "PublicationJob"
  ADD COLUMN IF NOT EXISTS "socialConnectionId" UUID,
  ADD COLUMN IF NOT EXISTS "externalPostUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "payloadSnapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastAttemptAt" TIMESTAMP;

DO $$ BEGIN
  ALTER TABLE "PublicationJob"
    ADD CONSTRAINT "PublicationJob_socialConnectionId_fkey"
    FOREIGN KEY ("socialConnectionId") REFERENCES "SocialConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "PublicationJob_contentId_idx" ON "PublicationJob"("contentId");
CREATE INDEX IF NOT EXISTS "PublicationJob_socialConnectionId_idx" ON "PublicationJob"("socialConnectionId");
CREATE INDEX IF NOT EXISTS "PublicationJob_status_idx" ON "PublicationJob"("status");
CREATE INDEX IF NOT EXISTS "PublicationJob_platform_idx" ON "PublicationJob"("platform");
