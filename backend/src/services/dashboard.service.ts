import { dashboardRepo } from "../repositories/dashboard.repo";

export const dashboardService = {
  async summary() {
    const now = new Date();
    const statusCounts = await dashboardRepo.statusCounts();
    const recentContent = await dashboardRepo.recentContent();
    const upcomingScheduledPublications = await dashboardRepo.upcomingPublications(now);

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

    return {
      readyToPublishCount: counts.READY,
      ideaCount: counts.IDEA,
      draftCount: counts.DRAFT,
      publishedCount: counts.PUBLISHED,
      recentContent,
      upcomingScheduledPublications
    };
  }
};
