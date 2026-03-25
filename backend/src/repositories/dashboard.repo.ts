import { prisma } from "../config/prisma";

export const dashboardRepo = {
  statusCounts() {
    return prisma.content.groupBy({
      by: ["status"],
      _count: { _all: true }
    });
  },
  recentContent() {
    return prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
  },
  upcomingPublications(now: Date) {
    return prisma.publicationJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { gte: now }
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { content: true }
    });
  }
};
