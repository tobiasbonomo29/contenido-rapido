import { publicationRepo } from "../repositories/publication.repo";
import { contentRepo } from "../repositories/content.repo";
import { AppError } from "../utils/errors";

export const publicationService = {
  async syncContentScheduledAt(contentId: string) {
    const nextPendingJob = await publicationRepo.getNextPendingByContent(contentId);

    await contentRepo.update(contentId, {
      scheduledAt: nextPendingJob?.scheduledAt ?? null
    });
  },
  async schedule(contentId: string, platform: "LINKEDIN" | "FACEBOOK", scheduledAt: string) {
    const content = await contentRepo.getById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404);
    }

    if (content.status !== "READY") {
      throw new AppError("Only READY content can be scheduled", 400);
    }

    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when <= new Date()) {
      throw new AppError("scheduledAt must be a future date", 400);
    }

    const job = await publicationRepo.create({
      content: { connect: { id: contentId } },
      platform,
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

    for (const job of dueJobs) {
      try {
        await publicationRepo.update(job.id, {
          status: "SENT",
          externalPostId: `mock-${job.id}`
        });

        await contentRepo.update(job.contentId, {
          status: "PUBLISHED",
          publishedAt: job.content.publishedAt || new Date()
        });

        await this.syncContentScheduledAt(job.contentId);
      } catch (error) {
        await publicationRepo.update(job.id, {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  }
};
