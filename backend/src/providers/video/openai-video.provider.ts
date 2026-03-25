import fs from "fs/promises";
import OpenAI, { toFile } from "openai";
import { VideoModel, VideoSize } from "openai/resources/videos";
import { AppError } from "../../utils/errors";
import { CreateVideoJobInput, CreateVideoJobResult, SyncVideoJobInput, SyncVideoJobResult, VideoProvider } from "./types";

type OpenAiMetadata = {
  engine: "openai-sora";
  requestedDurationSeconds: number;
  plannedDurationSeconds: number;
  segmentPlanSeconds: number[];
  submittedSegmentIndex: number;
  completedProviderIds: string[];
  completedSegmentSeconds: number;
  lastKnownProviderStatus: string;
  lastKnownProgress: number;
  model: string;
  size: string;
  requestedAspectRatio: string;
  referenceMode: "none" | "image_url" | "file_upload";
};

const CREATE_SEGMENTS = [12, 8, 4] as const;
const EXTEND_SEGMENTS = [20, 16, 12, 8, 4] as const;

function normalizeDurationSeconds(value: number) {
  const safeValue = Number.isFinite(value) ? Math.max(4, Math.min(120, Math.floor(value))) : 4;
  const flooredToFour = Math.floor(safeValue / 4) * 4;
  return Math.max(4, Math.min(120, flooredToFour));
}

function buildSegmentPlan(totalSeconds: number) {
  const plan: number[] = [];
  let remaining = normalizeDurationSeconds(totalSeconds);

  if (remaining <= 12) {
    const createSeconds = CREATE_SEGMENTS.find((candidate) => candidate <= remaining) ?? 4;
    plan.push(createSeconds);
    return plan;
  }

  plan.push(12);
  remaining -= 12;

  for (const candidate of EXTEND_SEGMENTS) {
    while (remaining >= candidate) {
      plan.push(candidate);
      remaining -= candidate;
    }
  }

  if (remaining > 0) {
    const fallback = EXTEND_SEGMENTS.find((candidate) => candidate >= remaining) ?? 4;
    plan.push(fallback);
  }

  return plan;
}

function toCreateSeconds(value: number) {
  return String(value) as "4" | "8" | "12";
}

function toExtendSeconds(value: number) {
  return String(value) as unknown as "4" | "8" | "12";
}

function mapProviderStatus(status: string) {
  switch (status) {
    case "queued":
      return "PENDING" as const;
    case "in_progress":
      return "PROCESSING" as const;
    case "completed":
      return "COMPLETED" as const;
    case "failed":
      return "FAILED" as const;
    default:
      return "PROCESSING" as const;
  }
}

function isOpenAiMetadata(value: Record<string, unknown> | null | undefined): value is OpenAiMetadata {
  return value?.engine === "openai-sora" && Array.isArray(value.segmentPlanSeconds);
}

function inferExtensionFromContentType(contentType: string | null) {
  if (!contentType) {
    return ".bin";
  }

  if (contentType.includes("mp4")) {
    return ".mp4";
  }

  if (contentType.includes("webp")) {
    return ".webp";
  }

  if (contentType.includes("jpeg")) {
    return ".jpg";
  }

  if (contentType.includes("png")) {
    return ".png";
  }

  return ".bin";
}

function isPublicReferenceUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
      return false;
    }

    if (parsed.hostname.endsWith(".local")) {
      return false;
    }

    return true;
  } catch (_error) {
    return false;
  }
}

export class OpenAiVideoProvider implements VideoProvider {
  readonly name = "openai" as const;
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  private async resolveInputReference(referenceAsset: CreateVideoJobInput["referenceAsset"]) {
    if (!referenceAsset) {
      return { inputReference: undefined, referenceMode: "none" as const };
    }

    if (referenceAsset.filePath) {
      const buffer = await fs.readFile(referenceAsset.filePath);
      return {
        inputReference: await toFile(buffer, referenceAsset.fileName, {
          type: referenceAsset.mimeType ?? undefined
        }),
        referenceMode: "file_upload" as const
      };
    }

    if (referenceAsset.publicUrl && isPublicReferenceUrl(referenceAsset.publicUrl)) {
      return {
        inputReference: {
          image_url: referenceAsset.publicUrl
        },
        referenceMode: "image_url" as const
      };
    }

    return { inputReference: undefined, referenceMode: "none" as const };
  }

  async create(input: CreateVideoJobInput): Promise<CreateVideoJobResult> {
    const plan = buildSegmentPlan(input.targetDurationSeconds);
    const { inputReference, referenceMode } = await this.resolveInputReference(input.referenceAsset);
    const job = await this.client.videos.create({
      model: input.model as VideoModel,
      prompt: input.prompt,
      size: input.targetSize as VideoSize,
      seconds: toCreateSeconds(plan[0]),
      input_reference: inputReference
    });

    return {
      provider: this.name,
      externalJobId: job.id,
      status: mapProviderStatus(job.status),
      providerMetadata: {
        engine: "openai-sora",
        requestedDurationSeconds: input.targetDurationSeconds,
        plannedDurationSeconds: plan.reduce((sum, segment) => sum + segment, 0),
        segmentPlanSeconds: plan,
        submittedSegmentIndex: 0,
        completedProviderIds: [],
        completedSegmentSeconds: 0,
        lastKnownProviderStatus: job.status,
        lastKnownProgress: job.progress ?? 0,
        model: input.model,
        size: input.targetSize,
        requestedAspectRatio: input.targetAspectRatio,
        referenceMode
      } satisfies OpenAiMetadata
    };
  }

  async sync(input: SyncVideoJobInput): Promise<SyncVideoJobResult> {
    if (!isOpenAiMetadata(input.providerMetadata)) {
      throw new AppError("Invalid OpenAI provider metadata", 500);
    }

    const metadata = input.providerMetadata;
    const job = await this.client.videos.retrieve(input.externalJobId);
    const mappedStatus = mapProviderStatus(job.status);
    const completedProviderIds = [...metadata.completedProviderIds];

    if (job.status === "failed") {
      return {
        status: "FAILED",
        externalJobId: input.externalJobId,
        errorMessage: job.error?.message ?? "OpenAI video generation failed",
        providerMetadata: {
          ...metadata,
          lastKnownProviderStatus: job.status,
          lastKnownProgress: job.progress ?? metadata.lastKnownProgress
        }
      };
    }

    if (job.status !== "completed") {
      return {
        status: mappedStatus,
        externalJobId: input.externalJobId,
        providerMetadata: {
          ...metadata,
          lastKnownProviderStatus: job.status,
          lastKnownProgress: job.progress ?? metadata.lastKnownProgress
        }
      };
    }

    const alreadyCompleted = completedProviderIds.includes(job.id);
    const currentIndex = metadata.submittedSegmentIndex;
    const nextCompletedProviderIds = alreadyCompleted ? completedProviderIds : [...completedProviderIds, job.id];
    const completedSegmentSeconds = alreadyCompleted
      ? metadata.completedSegmentSeconds
      : metadata.segmentPlanSeconds
          .slice(0, currentIndex + 1)
          .reduce((sum, segment) => sum + Number(segment), 0);

    const isFinalSegment = currentIndex >= metadata.segmentPlanSeconds.length - 1;

    if (!isFinalSegment) {
      const nextIndex = currentIndex + 1;
      const nextSegmentSeconds = Number(metadata.segmentPlanSeconds[nextIndex]);
      const extension = await this.client.videos.extend({
        video: { id: job.id },
        prompt: `${input.prompt}\n\nContinue the same story seamlessly for the next segment.`,
        seconds: toExtendSeconds(nextSegmentSeconds)
      });

      return {
        status: mapProviderStatus(extension.status),
        externalJobId: extension.id,
        providerMetadata: {
          ...metadata,
          submittedSegmentIndex: nextIndex,
          completedProviderIds: nextCompletedProviderIds,
          completedSegmentSeconds,
          lastKnownProviderStatus: extension.status,
          lastKnownProgress: extension.progress ?? 0
        }
      };
    }

    const [videoResponse, thumbnailResponse] = await Promise.all([
      this.client.videos.downloadContent(job.id, { variant: "video" }),
      this.client.videos.downloadContent(job.id, { variant: "thumbnail" }).catch(() => null)
    ]);

    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    const videoExtension = inferExtensionFromContentType(videoResponse.headers.get("content-type"));

    let thumbnailFile: SyncVideoJobResult["thumbnailFile"];
    if (thumbnailResponse) {
      const thumbnailBuffer = Buffer.from(await thumbnailResponse.arrayBuffer());
      thumbnailFile = {
        buffer: thumbnailBuffer,
        extension: inferExtensionFromContentType(thumbnailResponse.headers.get("content-type"))
      };
    }

    return {
      status: "COMPLETED",
      externalJobId: job.id,
      providerMetadata: {
        ...metadata,
        completedProviderIds: nextCompletedProviderIds,
        completedSegmentSeconds,
        lastKnownProviderStatus: job.status,
        lastKnownProgress: job.progress ?? 100,
        downloadedAt: Date.now()
      },
      videoFile: {
        buffer: videoBuffer,
        extension: videoExtension
      },
      thumbnailFile
    };
  }
}
