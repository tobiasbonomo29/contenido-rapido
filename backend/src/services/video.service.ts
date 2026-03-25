import fs from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { getResolvedVideoProviderName, getVideoProvider } from "../providers/video";
import { CreateVideoJobInput } from "../providers/video/types";
import { contentRepo } from "../repositories/content.repo";
import { videoDraftRepo } from "../repositories/video-draft.repo";
import { videoRepo } from "../repositories/video.repo";
import { AppError } from "../utils/errors";
import { uploadService } from "./upload.service";

type VideoRecord = NonNullable<Awaited<ReturnType<typeof videoRepo.getById>>>;
type ApprovedVideoDraft = NonNullable<Awaited<ReturnType<typeof videoDraftRepo.getLatestApprovedByContent>>>;

const generationEligibleStatuses = new Set(["DRAFT", "READY", "PUBLISHED"]);
const activeVideoStatuses = new Set(["PENDING", "PROCESSING"]);

const aspectRatioToSizeMap: Record<string, "720x1280" | "1280x720" | "1024x1792" | "1792x1024"> = {
  "9:16": "720x1280",
  "16:9": "1280x720",
  "1:1": "1280x720"
};

function toProviderMetadata(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getMimeTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return null;
  }
}

function serializeJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function extractSectionLines(draft: ApprovedVideoDraft) {
  const sections = Array.isArray(draft.sections) ? draft.sections : [];
  return sections
    .map((section) => {
      if (!section || typeof section !== "object") {
        return null;
      }

      const label = "label" in section && typeof section.label === "string" ? section.label : "Section";
      const narration = "narration" in section && typeof section.narration === "string" ? section.narration : "";
      return narration ? `${label}: ${narration}` : null;
    })
    .filter((line): line is string => Boolean(line));
}

function extractSceneDirectionLines(draft: ApprovedVideoDraft) {
  const scenes = Array.isArray(draft.sceneDirections) ? draft.sceneDirections : [];
  return scenes
    .map((scene) => {
      if (!scene || typeof scene !== "object") {
        return null;
      }

      const title = "title" in scene && typeof scene.title === "string" ? scene.title : "Scene";
      const description = "direction" in scene && typeof scene.direction === "string" ? scene.direction : "";
      return description ? `${title}: ${description}` : null;
    })
    .filter((line): line is string => Boolean(line));
}

function buildPrompt(content: VideoRecord["content"], draft: ApprovedVideoDraft) {
  const sectionLines = extractSectionLines(draft);
  const sceneLines = extractSceneDirectionLines(draft);
  const brandingHints = draft.brandingHints && typeof draft.brandingHints === "object" ? draft.brandingHints : null;
  const brandingSummary = brandingHints
    ? Object.entries(brandingHints)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join("; ")
    : "Use clean social branding without visible logos or watermarks.";

  return [
    `Create a polished social storytelling video for the topic "${content.topic}".`,
    `Title: ${content.title}.`,
    `Objective: ${content.objective}.`,
    `Content type: ${content.contentType}.`,
    `Target language: ${content.language === "ES" ? "Spanish" : "English"}.`,
    `Target aspect ratio: ${draft.targetAspectRatio}.`,
    `Visual style: ${draft.visualStyle}.`,
    `Voice style: ${draft.voiceStyle}.`,
    `Narrative hook: ${draft.hook}.`,
    `Narration guidance: ${draft.voiceoverText}.`,
    `Visual direction: ${draft.visualPrompt}.`,
    `Section outline: ${sectionLines.join(" | ")}.`,
    `Scene directions: ${sceneLines.join(" | ")}.`,
    `Branding hints: ${brandingSummary}.`,
    `Keep the pacing tight, visually coherent, suitable for LinkedIn/Facebook social video.`,
    `Avoid gibberish text, bad typography, UI screenshots, watermarks, or copyrighted brand marks.`
  ].join("\n");
}

function resolveTargetSize(targetAspectRatio: string) {
  return aspectRatioToSizeMap[targetAspectRatio] ?? "720x1280";
}

async function buildReferenceAsset(content: VideoRecord["content"]): Promise<CreateVideoJobInput["referenceAsset"]> {
  if (!content.imageUrl) {
    return null;
  }

  const localFilePath = uploadService.resolveLocalUploadPath(content.imageUrl);
  if (localFilePath) {
    return {
      fileName: path.basename(localFilePath),
      filePath: localFilePath,
      publicUrl: content.imageUrl,
      mimeType: getMimeTypeFromPath(localFilePath)
    };
  }

  try {
    const parsed = new URL(content.imageUrl);
    return {
      fileName: path.basename(parsed.pathname) || "reference-image",
      publicUrl: content.imageUrl,
      mimeType: getMimeTypeFromPath(parsed.pathname)
    };
  } catch (_error) {
    return null;
  }
}

function shouldSync(video: VideoRecord) {
  return activeVideoStatuses.has(video.status) && Date.now() - video.updatedAt.getTime() >= env.videoSyncMinAgeMs;
}

async function persistProviderOutput(video: VideoRecord, providerResult: Awaited<ReturnType<ReturnType<typeof getVideoProvider>["sync"]>>) {
  let videoUrl: string | undefined;
  let providerMetadata = providerResult.providerMetadata;

  if (providerResult.videoFile) {
    await uploadService.ensureGeneratedVideoDir();
    const videoFileName = `${video.id}${providerResult.videoFile.extension}`;
    const videoFilePath = uploadService.buildGeneratedVideoPath(videoFileName);
    await fs.writeFile(videoFilePath, providerResult.videoFile.buffer);
    videoUrl = uploadService.buildGeneratedVideoPublicUrl(videoFileName);
  } else {
    const mockVideoUrl =
      typeof providerResult.providerMetadata.mockVideoUrl === "string"
        ? providerResult.providerMetadata.mockVideoUrl
        : undefined;
    videoUrl = mockVideoUrl;
  }

  if (providerResult.thumbnailFile) {
    await uploadService.ensureGeneratedVideoDir();
    const thumbnailFileName = `${video.id}-thumbnail${providerResult.thumbnailFile.extension}`;
    const thumbnailPath = uploadService.buildGeneratedVideoPath(thumbnailFileName);
    await fs.writeFile(thumbnailPath, providerResult.thumbnailFile.buffer);
    providerMetadata = {
      ...providerMetadata,
      thumbnailUrl: uploadService.buildGeneratedVideoPublicUrl(thumbnailFileName)
    };
  }

  return {
    providerMetadata,
    videoUrl
  };
}

async function syncVideoRecord(video: VideoRecord) {
  if (!activeVideoStatuses.has(video.status)) {
    return video;
  }

  if (!video.externalJobId) {
    return videoRepo.update(video.id, {
      status: "FAILED",
      errorMessage: "Missing external job id"
    });
  }

  const provider = getVideoProvider();
  const providerResult = await provider.sync({
    internalVideoId: video.id,
    prompt: video.promptUsed,
    targetDurationSeconds:
      typeof video.providerMetadata === "object" &&
      video.providerMetadata &&
      "requestedDurationSeconds" in video.providerMetadata &&
      typeof video.providerMetadata.requestedDurationSeconds === "number"
        ? video.providerMetadata.requestedDurationSeconds
        : video.videoDraft?.targetDurationSeconds ?? 12,
    targetAspectRatio: video.videoDraft?.targetAspectRatio ?? "9:16",
    targetSize:
      typeof video.providerMetadata === "object" &&
      video.providerMetadata &&
      "size" in video.providerMetadata &&
      typeof video.providerMetadata.size === "string"
        ? video.providerMetadata.size
        : resolveTargetSize(video.videoDraft?.targetAspectRatio ?? "9:16"),
    model:
      typeof video.providerMetadata === "object" &&
      video.providerMetadata &&
      "model" in video.providerMetadata &&
      typeof video.providerMetadata.model === "string"
        ? video.providerMetadata.model
        : env.openAiVideoModel,
    referenceAsset: await buildReferenceAsset(video.content),
    externalJobId: video.externalJobId,
    providerMetadata: toProviderMetadata(video.providerMetadata)
  });

  const providerOutput = providerResult.status === "COMPLETED" ? await persistProviderOutput(video, providerResult) : null;

  return videoRepo.update(video.id, {
    status: providerResult.status,
    externalJobId: providerResult.externalJobId,
    providerMetadata: serializeJson(providerOutput?.providerMetadata ?? providerResult.providerMetadata),
    videoUrl: providerOutput?.videoUrl ?? undefined,
    errorMessage: providerResult.errorMessage ?? null
  });
}

export const videoService = {
  async generate(contentId: string) {
    const content = await contentRepo.getById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404);
    }

    if (!generationEligibleStatuses.has(content.status)) {
      throw new AppError("Video generation allowed only for DRAFT, READY or PUBLISHED content", 400);
    }

    const approvedDraft = await videoDraftRepo.getLatestApprovedByContent(contentId);
    if (!approvedDraft) {
      throw new AppError("An APPROVED video draft is required before generating a video", 400);
    }

    const activeVideo = await videoRepo.getLatestActiveByContent(contentId);
    if (activeVideo) {
      return shouldSync(activeVideo) ? syncVideoRecord(activeVideo) : activeVideo;
    }

    const prompt = buildPrompt(content, approvedDraft);
    const provider = getVideoProvider();
    const targetSize = resolveTargetSize(approvedDraft.targetAspectRatio);

    const created = await videoRepo.create({
      content: { connect: { id: contentId } },
      videoDraft: { connect: { id: approvedDraft.id } },
      promptUsed: prompt,
      scriptUsed: approvedDraft.fullScript,
      provider: getResolvedVideoProviderName(),
      status: "PENDING",
      subtitlesText: approvedDraft.subtitlesText,
      voiceoverText: approvedDraft.voiceoverText
    });

    try {
      const referenceAsset = await buildReferenceAsset(content);
      const providerResult = await provider.create({
        internalVideoId: created.id,
        prompt,
        targetDurationSeconds: approvedDraft.targetDurationSeconds,
        targetAspectRatio: approvedDraft.targetAspectRatio,
        targetSize,
        model: env.openAiVideoModel,
        referenceAsset
      });

      return videoRepo.update(created.id, {
        provider: providerResult.provider,
        status: providerResult.status,
        externalJobId: providerResult.externalJobId,
        providerMetadata: serializeJson(providerResult.providerMetadata),
        errorMessage: providerResult.errorMessage ?? null
      });
    } catch (error) {
      await videoRepo.update(created.id, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Video generation failed"
      });

      throw error;
    }
  },
  async getById(id: string) {
    const video = await videoRepo.getById(id);
    if (!video) {
      return null;
    }

    return shouldSync(video) ? syncVideoRecord(video) : video;
  },
  async getByContent(contentId: string) {
    const videos = await videoRepo.getByContent(contentId);
    const synced = await Promise.all(
      videos.map((video) => {
        if (!shouldSync(video)) {
          return video;
        }

        return syncVideoRecord(video);
      })
    );

    return synced;
  },
  async syncActiveGenerations() {
    const activeVideos = await videoRepo.getActive();

    for (const video of activeVideos) {
      try {
        await syncVideoRecord(video);
      } catch (error) {
        await videoRepo.update(video.id, {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Video generation sync failed"
        });
      }
    }
  }
};
