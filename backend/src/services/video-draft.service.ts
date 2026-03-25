import { Prisma, VideoDraftStatus } from "@prisma/client";
import { env } from "../config/env";
import { contentRepo } from "../repositories/content.repo";
import { videoDraftRepo } from "../repositories/video-draft.repo";
import { AppError } from "../utils/errors";
import { createVideoDraftBlueprint } from "./video-draft-builder";
import { videoService } from "./video.service";

type EditableVideoDraftInput = Partial<{
  formatProfile: Record<string, unknown>;
  hook: string;
  sections: Array<Record<string, unknown>>;
  fullScript: string;
  subtitlesText: string;
  subtitlesSegments: Array<Record<string, unknown>>;
  voiceoverText: string;
  visualPrompt: string;
  sceneDirections: Array<Record<string, unknown>>;
  brandingHints: Record<string, unknown> | null;
  targetDurationSeconds: number;
  targetAspectRatio: string;
  voiceStyle: string;
  visualStyle: string;
}>;

const generationEligibleStatuses = new Set(["DRAFT", "READY", "PUBLISHED"]);
const finalStatuses = new Set<VideoDraftStatus>(["RENDERED", "SCHEDULED", "PUBLISHED"]);

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function hasRequiredContentFields(content: {
  title: string;
  objective: string;
  topic: string;
  bodyText: string;
  contentType: string;
}) {
  return [content.title, content.objective, content.topic, content.bodyText, content.contentType].every(
    (field) => field && field.trim().length > 0
  );
}

function canTransition(current: VideoDraftStatus, next: VideoDraftStatus) {
  if (current === next) return true;

  const allowedTransitions: Record<VideoDraftStatus, VideoDraftStatus[]> = {
    DRAFT: ["SCRIPT_READY", "PREVIEW_READY", "APPROVED"],
    SCRIPT_READY: ["PREVIEW_READY", "APPROVED"],
    PREVIEW_READY: ["APPROVED"],
    APPROVED: ["RENDERED", "SCHEDULED", "PUBLISHED"],
    RENDERED: ["SCHEDULED", "PUBLISHED"],
    SCHEDULED: ["PUBLISHED"],
    PUBLISHED: []
  };

  return allowedTransitions[current].includes(next);
}

export const videoDraftService = {
  async generate(contentId: string) {
    const content = await contentRepo.getById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404);
    }

    if (!generationEligibleStatuses.has(content.status)) {
      throw new AppError("Video drafts can only be generated from DRAFT, READY or PUBLISHED content", 400);
    }

    if (!hasRequiredContentFields(content)) {
      throw new AppError("Content is missing required fields for draft generation", 400);
    }

    const blueprint = createVideoDraftBlueprint({
      id: content.id,
      title: content.title,
      objective: content.objective,
      topic: content.topic,
      contentType: content.contentType,
      bodyText: content.bodyText,
      source: content.source,
      imageUrl: content.imageUrl,
      language: content.language
    });

    return videoDraftRepo.create({
      content: { connect: { id: contentId } },
      formatProfile: toJson(blueprint.formatProfile),
      hook: blueprint.hook,
      sections: toJson(blueprint.sections),
      fullScript: blueprint.fullScript,
      subtitlesText: blueprint.subtitlesText,
      subtitlesSegments: toJson(blueprint.subtitlesSegments),
      voiceoverText: blueprint.voiceoverText,
      visualPrompt: blueprint.visualPrompt,
      sceneDirections: toJson(blueprint.sceneDirections),
      brandingHints: toJson(blueprint.brandingHints),
      targetDurationSeconds: blueprint.targetDurationSeconds,
      targetAspectRatio: blueprint.targetAspectRatio,
      voiceStyle: blueprint.voiceStyle,
      visualStyle: blueprint.visualStyle,
      status: blueprint.status
    });
  },
  async getById(id: string) {
    const draft = await videoDraftRepo.getById(id);
    if (!draft) {
      throw new AppError("Video draft not found", 404);
    }

    return draft;
  },
  getByContent(contentId: string) {
    return videoDraftRepo.getByContent(contentId);
  },
  async update(id: string, data: EditableVideoDraftInput) {
    const draft = await videoDraftRepo.getById(id);
    if (!draft) {
      throw new AppError("Video draft not found", 404);
    }

    if (finalStatuses.has(draft.status)) {
      throw new AppError("Rendered or scheduled drafts cannot be edited", 400);
    }

    const nextStatus = draft.status === "DRAFT" ? "DRAFT" : "SCRIPT_READY";

    return videoDraftRepo.update(id, {
      formatProfile: data.formatProfile ? toJson(data.formatProfile) : undefined,
      hook: data.hook,
      sections: data.sections ? toJson(data.sections) : undefined,
      fullScript: data.fullScript,
      subtitlesText: data.subtitlesText,
      subtitlesSegments: data.subtitlesSegments ? toJson(data.subtitlesSegments) : undefined,
      voiceoverText: data.voiceoverText,
      visualPrompt: data.visualPrompt,
      sceneDirections: data.sceneDirections ? toJson(data.sceneDirections) : undefined,
      brandingHints:
        data.brandingHints === null ? Prisma.JsonNull : data.brandingHints ? toJson(data.brandingHints) : undefined,
      targetDurationSeconds: data.targetDurationSeconds,
      targetAspectRatio: data.targetAspectRatio,
      voiceStyle: data.voiceStyle,
      visualStyle: data.visualStyle,
      status: nextStatus,
      approvedAt: null
    });
  },
  async approve(id: string) {
    const draft = await videoDraftRepo.getById(id);
    if (!draft) {
      throw new AppError("Video draft not found", 404);
    }

    if (finalStatuses.has(draft.status)) {
      throw new AppError("Rendered or scheduled drafts cannot be re-approved", 400);
    }

    const approvedDraft = await videoDraftRepo.updateStatus(id, "APPROVED", new Date());

    if (env.videoAutoGenerateOnApproval) {
      void videoService.generate(approvedDraft.contentId).catch((error) => {
        console.error("Automatic video generation failed", error);
      });
    }

    return approvedDraft;
  },
  async updateStatus(id: string, status: VideoDraftStatus) {
    const draft = await videoDraftRepo.getById(id);
    if (!draft) {
      throw new AppError("Video draft not found", 404);
    }

    if (!canTransition(draft.status, status)) {
      throw new AppError("Invalid video draft status transition", 400);
    }

    return videoDraftRepo.updateStatus(id, status, status === "APPROVED" ? new Date() : draft.approvedAt ?? null);
  }
};
