CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE "ContentStatus" AS ENUM ('IDEA', 'DRAFT', 'READY', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContentType" AS ENUM ('DID_YOU_KNOW', 'INFOGRAPHIC', 'AUTHOR_BOOK', 'QUIZ', 'HISTORY', 'ANALYSIS', 'DAILY_HEADLINES');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Language" AS ENUM ('ES', 'EN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PublicationPlatform" AS ENUM ('LINKEDIN', 'FACEBOOK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PublicationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Content" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "contentType" "ContentType" NOT NULL,
  "bodyText" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "imageUrl" TEXT,
  "status" "ContentStatus" NOT NULL DEFAULT 'IDEA',
  "language" "Language" NOT NULL,
  "scheduledAt" TIMESTAMP,
  "publishedAt" TIMESTAMP,
  "metrics" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdById" UUID NOT NULL,
  CONSTRAINT "Content_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Template" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "contentType" "ContentType" NOT NULL,
  "description" TEXT NOT NULL,
  "defaultStructure" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Source" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "VideoGeneration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" UUID NOT NULL,
  "promptUsed" TEXT NOT NULL,
  "scriptUsed" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" "VideoStatus" NOT NULL,
  "videoUrl" TEXT,
  "subtitlesText" TEXT,
  "voiceoverText" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "VideoGeneration_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PublicationJob" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" UUID NOT NULL,
  "platform" "PublicationPlatform" NOT NULL,
  "scheduledAt" TIMESTAMP NOT NULL,
  "status" "PublicationStatus" NOT NULL,
  "externalPostId" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "PublicationJob_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Content_status_idx" ON "Content"("status");
CREATE INDEX IF NOT EXISTS "Content_contentType_idx" ON "Content"("contentType");
CREATE INDEX IF NOT EXISTS "Content_language_idx" ON "Content"("language");
CREATE INDEX IF NOT EXISTS "PublicationJob_status_scheduledAt_idx" ON "PublicationJob"("status", "scheduledAt");
