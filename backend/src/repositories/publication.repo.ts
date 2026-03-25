import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const publicationRepo = {
  list(filters?: { contentId?: string }) {
    const where: Prisma.PublicationJobWhereInput = {};

    if (filters?.contentId) {
      where.contentId = filters.contentId;
    }

    return prisma.publicationJob.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      include: { content: true }
    });
  },
  getById(id: string) {
    return prisma.publicationJob.findUnique({
      where: { id },
      include: { content: true }
    });
  },
  create(data: Prisma.PublicationJobCreateInput) {
    return prisma.publicationJob.create({ data });
  },
  update(id: string, data: Prisma.PublicationJobUpdateInput) {
    return prisma.publicationJob.update({ where: { id }, data });
  },
  getNextPendingByContent(contentId: string) {
    return prisma.publicationJob.findFirst({
      where: {
        contentId,
        status: "PENDING"
      },
      orderBy: { scheduledAt: "asc" }
    });
  },
  getDue(now: Date) {
    return prisma.publicationJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: now }
      },
      include: { content: true }
    });
  }
};
