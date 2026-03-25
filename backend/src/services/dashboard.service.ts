import { dashboardRepo } from "../repositories/dashboard.repo";

export const dashboardService = {
  async summary() {
    const now = new Date();
    const [statusCounts, videoStatusCounts, recentContent, recentVideoGenerations, upcomingScheduledPublications] =
      await Promise.all([
        dashboardRepo.statusCounts(),
        dashboardRepo.videoStatusCounts(),
        dashboardRepo.recentContent(),
        dashboardRepo.recentVideoGenerations(),
        dashboardRepo.upcomingPublications(now)
      ]);

    const counts = statusCounts.reduce(
      (accumulator, item) => {
        accumulator[item.status] = item._count._all;
        return accumulator;
      },
      {
        IDEA: 0,
        DRAFT: 0,
        READY: 0,
        PUBLISHED: 0
      } as Record<"IDEA" | "DRAFT" | "READY" | "PUBLISHED", number>
    );

    const videoCounts = videoStatusCounts.reduce(
      (accumulator, item) => {
        accumulator[item.status] = item._count._all;
        return accumulator;
      },
      {
        PENDING: 0,
        PROCESSING: 0,
        COMPLETED: 0,
        FAILED: 0
      } as Record<"PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", number>
    );

    return {
      readyToPublishCount: counts.READY,
      ideaCount: counts.IDEA,
      draftCount: counts.DRAFT,
      publishedCount: counts.PUBLISHED,
      videoGenerationCounts: {
        pending: videoCounts.PENDING,
        processing: videoCounts.PROCESSING,
        completed: videoCounts.COMPLETED,
        failed: videoCounts.FAILED
      },
      recentContent,
      recentVideoGenerations,
      upcomingScheduledPublications
    };
  }
};
