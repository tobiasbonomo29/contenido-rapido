import { CreateVideoJobInput, CreateVideoJobResult, SyncVideoJobInput, SyncVideoJobResult, VideoProvider } from "./types";

const MOCK_PENDING_MS = 1500;
const MOCK_COMPLETED_MS = 4000;

export class MockVideoProvider implements VideoProvider {
  readonly name = "mock" as const;

  async create(input: CreateVideoJobInput): Promise<CreateVideoJobResult> {
    const startedAt = Date.now();

    return {
      provider: this.name,
      externalJobId: `mock-${input.internalVideoId}`,
      status: "PENDING",
      providerMetadata: {
        engine: "mock-video-provider",
        startedAt,
        promptLength: input.prompt.length,
        targetDurationSeconds: input.targetDurationSeconds,
        mockVideoUrl: `https://videos.local/${input.internalVideoId}.mp4`
      }
    };
  }

  async sync(input: SyncVideoJobInput): Promise<SyncVideoJobResult> {
    const startedAt =
      typeof input.providerMetadata?.startedAt === "number" ? input.providerMetadata.startedAt : Date.now();
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs < MOCK_PENDING_MS) {
      return {
        status: "PENDING",
        externalJobId: input.externalJobId,
        providerMetadata: {
          ...input.providerMetadata,
          startedAt,
          lastKnownProviderStatus: "queued"
        }
      };
    }

    if (elapsedMs < MOCK_COMPLETED_MS) {
      return {
        status: "PROCESSING",
        externalJobId: input.externalJobId,
        providerMetadata: {
          ...input.providerMetadata,
          startedAt,
          lastKnownProviderStatus: "in_progress"
        }
      };
    }

    return {
      status: "COMPLETED",
      externalJobId: input.externalJobId,
      providerMetadata: {
        ...input.providerMetadata,
        startedAt,
        completedAt: Date.now(),
        lastKnownProviderStatus: "completed"
      }
    };
  }
}
