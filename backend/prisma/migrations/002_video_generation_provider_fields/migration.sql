ALTER TABLE "VideoGeneration"
  ADD COLUMN IF NOT EXISTS "videoDraftId" UUID,
  ADD COLUMN IF NOT EXISTS "externalJobId" TEXT,
  ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "providerMetadata" JSONB;

DO $$ BEGIN
  ALTER TABLE "VideoGeneration"
    ADD CONSTRAINT "VideoGeneration_videoDraftId_fkey"
    FOREIGN KEY ("videoDraftId") REFERENCES "VideoDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "VideoGeneration_contentId_idx" ON "VideoGeneration"("contentId");
CREATE INDEX IF NOT EXISTS "VideoGeneration_videoDraftId_idx" ON "VideoGeneration"("videoDraftId");
CREATE INDEX IF NOT EXISTS "VideoGeneration_status_idx" ON "VideoGeneration"("status");
CREATE INDEX IF NOT EXISTS "VideoGeneration_externalJobId_idx" ON "VideoGeneration"("externalJobId");
