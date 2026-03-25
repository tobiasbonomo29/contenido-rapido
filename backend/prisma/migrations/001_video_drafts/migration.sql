DO $$ BEGIN
  CREATE TYPE "VideoDraftStatus" AS ENUM (
    'DRAFT',
    'SCRIPT_READY',
    'PREVIEW_READY',
    'APPROVED',
    'RENDERED',
    'SCHEDULED',
    'PUBLISHED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "VideoDraft" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" UUID NOT NULL,
  "formatProfile" JSONB NOT NULL,
  "hook" TEXT NOT NULL,
  "sections" JSONB NOT NULL,
  "fullScript" TEXT NOT NULL,
  "subtitlesText" TEXT NOT NULL,
  "subtitlesSegments" JSONB NOT NULL,
  "voiceoverText" TEXT NOT NULL,
  "visualPrompt" TEXT NOT NULL,
  "sceneDirections" JSONB NOT NULL,
  "brandingHints" JSONB,
  "targetDurationSeconds" INTEGER NOT NULL,
  "targetAspectRatio" TEXT NOT NULL,
  "voiceStyle" TEXT NOT NULL,
  "visualStyle" TEXT NOT NULL,
  "status" "VideoDraftStatus" NOT NULL DEFAULT 'SCRIPT_READY',
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "VideoDraft_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "VideoDraft_contentId_idx" ON "VideoDraft"("contentId");
CREATE INDEX IF NOT EXISTS "VideoDraft_status_idx" ON "VideoDraft"("status");
