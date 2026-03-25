import { VideoStatus } from "@prisma/client";

export type SupportedVideoProvider = "openai" | "mock";

export type VideoReferenceAsset = {
  fileName: string;
  filePath?: string | null;
  publicUrl?: string | null;
  mimeType?: string | null;
} | null;

export type CreateVideoJobInput = {
  internalVideoId: string;
  prompt: string;
  targetDurationSeconds: number;
  targetAspectRatio: string;
  targetSize: string;
  model: string;
  referenceAsset: VideoReferenceAsset;
};

export type CreateVideoJobResult = {
  provider: SupportedVideoProvider;
  externalJobId: string | null;
  status: VideoStatus;
  providerMetadata: Record<string, unknown>;
  errorMessage?: string | null;
};

export type SyncVideoJobInput = CreateVideoJobInput & {
  externalJobId: string;
  providerMetadata: Record<string, unknown> | null;
};

export type SyncVideoJobResult = {
  status: VideoStatus;
  externalJobId: string;
  providerMetadata: Record<string, unknown>;
  errorMessage?: string | null;
  videoFile?: {
    buffer: Buffer;
    extension: string;
  };
  thumbnailFile?: {
    buffer: Buffer;
    extension: string;
  };
};

export interface VideoProvider {
  readonly name: SupportedVideoProvider;
  create(input: CreateVideoJobInput): Promise<CreateVideoJobResult>;
  sync(input: SyncVideoJobInput): Promise<SyncVideoJobResult>;
}
