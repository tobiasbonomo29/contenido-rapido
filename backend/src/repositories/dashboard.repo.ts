import { prisma } from "../config/prisma";
import { dbCall } from "../utils/db";

export const dashboardRepo = {
  statusCounts() {
    return dbCall(() =>
      prisma.content.groupBy({
        by: ["status"],
        _count: { _all: true }
      })
    );
  },
  recentContent() {
    return dbCall(() =>
      prisma.content.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      })
    );
  },
  videoStatusCounts() {
    return dbCall(() =>
      prisma.videoGeneration.groupBy({
        by: ["status"],
        _count: { _all: true }
      })
    );
  },
  recentVideoGenerations() {
    return dbCall(() =>
      prisma.videoGeneration.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          content: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          videoDraft: {
            select: {
              id: true,
              status: true
            }
          }
        }
      })
    );
  },
  upcomingPublications(now: Date) {
    return dbCall(() =>
      prisma.publicationJob.findMany({
        where: {
          status: "PENDING",
          scheduledAt: { gte: now }
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: { content: true }
      })
    );
  }
};
