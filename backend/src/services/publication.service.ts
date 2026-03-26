import { Prisma, PublicationPlatform } from "@prisma/client";
import { contentRepo } from "../repositories/content.repo";
import { publicationRepo } from "../repositories/publication.repo";
import { socialConnectionRepo } from "../repositories/social-connection.repo";
import { videoDraftRepo } from "../repositories/video-draft.repo";
import { videoRepo } from "../repositories/video.repo";
import { facebookPublisher, linkedinPublisher, resolveShareableUrl } from "../providers/publishing";
import { PublishableJob } from "../providers/publishing/types";
import { socialConnectionService } from "./social-connection.service";
import { AppError } from "../utils/errors";

function serializeJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

async function resolvePublishableJob(job: Awaited<ReturnType<typeof publicationRepo.getById>>) {
  if (!job) {
    throw new AppError("Publication job not found", 404);
  }

  let connection = job.socialConnection;

  if (!connection) {
    connection = await socialConnectionRepo.getFirstActiveByUserAndPlatform(job.content.createdById, job.platform);
  }

  if (!connection) {
    throw new AppError(`No active ${job.platform === "LINKEDIN" ? "LinkedIn" : "Facebook"} connection found`, 400);
  }

  const preparedConnection = await socialConnectionService.prepareForPublishing(connection);

  return {
    ...job,
    socialConnection: preparedConnection
  } as PublishableJob;
}

async function publishJob(job: PublishableJob) {
  const latestCompletedVideo = await videoRepo.getLatestCompletedByContent(job.contentId);
  const shareableUrl = resolveShareableUrl(job.content, latestCompletedVideo?.videoUrl ?? null);

  if (job.platform === "LINKEDIN") {
    return linkedinPublisher.publish(job, shareableUrl);
  }

  if (job.platform === "FACEBOOK") {
    return facebookPublisher.publish(job, shareableUrl);
  }

  throw new AppError("Unsupported publication platform", 400);
}

export const publicationService = {
  async syncContentScheduledAt(contentId: string) {
    const nextPendingJob = await publicationRepo.getNextPendingByContent(contentId);

    await contentRepo.update(contentId, {
      scheduledAt: nextPendingJob?.scheduledAt ?? null
    });
  },
  async schedule(
    contentId: string,
    platform: PublicationPlatform,
    scheduledAt: string,
    userId: string,
    socialConnectionId?: string
  ) {
    const content = await contentRepo.getById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404);
    }

    if (content.createdById !== userId) {
      throw new AppError("You cannot schedule content owned by another user", 403);
    }

    if (content.status !== "READY") {
      throw new AppError("Only READY content can be scheduled", 400);
    }

    const videoDraftCount = await videoDraftRepo.hasAnyByContent(contentId);
    if (videoDraftCount > 0) {
      const approvedVideoDraftCount = await videoDraftRepo.hasApprovedByContent(contentId);
      if (approvedVideoDraftCount === 0) {
        throw new AppError("An APPROVED video draft is required before scheduling this content", 400);
      }
    }

    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when <= new Date()) {
      throw new AppError("scheduledAt must be a future date", 400);
    }

    const socialConnection = await socialConnectionService.resolveConnectionForScheduling(userId, platform, socialConnectionId);

    const job = await publicationRepo.create({
      content: { connect: { id: contentId } },
      platform,
      socialConnection: { connect: { id: socialConnection.id } },
      scheduledAt: when,
      status: "PENDING"
    });

    await this.syncContentScheduledAt(contentId);

    return job;
  },
  list(filters?: { contentId?: string }) {
    return publicationRepo.list(filters);
  },
  async cancel(id: string) {
    const job = await publicationRepo.getById(id);
    if (!job) {
      throw new AppError("Publication job not found", 404);
    }

    if (job.status !== "PENDING") {
      throw new AppError("Only pending publication jobs can be canceled", 400);
    }

    const canceledJob = await publicationRepo.update(id, { status: "CANCELED" });
    await this.syncContentScheduledAt(job.contentId);

    return canceledJob;
  },
  async processDueJobs() {
    const dueJobs = await publicationRepo.getDue(new Date());

    for (const queuedJob of dueJobs) {
      try {
        const job = await resolvePublishableJob(queuedJob);
        const publishResult = await publishJob(job);

        await publicationRepo.update(job.id, {
          status: "SENT",
          socialConnection: { connect: { id: job.socialConnection.id } },
          externalPostId: publishResult.externalPostId,
          externalPostUrl: publishResult.externalPostUrl ?? null,
          payloadSnapshot: serializeJson(publishResult.payloadSnapshot),
          errorMessage: null,
          lastAttemptAt: new Date(),
          attemptCount: {
            increment: 1
          }
        });

        await contentRepo.update(job.contentId, {
          status: "PUBLISHED",
          publishedAt: job.content.publishedAt || new Date()
        });

        await this.syncContentScheduledAt(job.contentId);
      } catch (error) {
        await publicationRepo.update(queuedJob.id, {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          lastAttemptAt: new Date(),
          attemptCount: {
            increment: 1
          }
        });
      }
    }
  }
};
