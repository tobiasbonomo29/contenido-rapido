import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { dbCall } from "../utils/db";

export const publicationRepo = {
  list(filters?: { contentId?: string }) {
    const where: Prisma.PublicationJobWhereInput = {};

    if (filters?.contentId) {
      where.contentId = filters.contentId;
    }

    return dbCall(() =>
      prisma.publicationJob.findMany({
        where,
        orderBy: { scheduledAt: "desc" },
        include: { content: true, socialConnection: true }
      })
    );
  },
  getById(id: string) {
    return dbCall(() =>
      prisma.publicationJob.findUnique({
        where: { id },
        include: { content: true, socialConnection: true }
      })
    );
  },
  create(data: Prisma.PublicationJobCreateInput) {
    return dbCall(() =>
      prisma.publicationJob.create({
        data,
        include: { content: true, socialConnection: true }
      })
    );
  },
  getLatestByContent(contentId: string) {
    return dbCall(() =>
      prisma.publicationJob.findFirst({
        where: { contentId },
        orderBy: { createdAt: "desc" },
        include: { content: true, socialConnection: true }
      })
    );
  },
  update(id: string, data: Prisma.PublicationJobUpdateInput) {
    return dbCall(() =>
      prisma.publicationJob.update({
        where: { id },
        data,
        include: { content: true, socialConnection: true }
      })
    );
  },
  getNextPendingByContent(contentId: string) {
    return dbCall(() =>
      prisma.publicationJob.findFirst({
        where: {
          contentId,
          status: "PENDING"
        },
        orderBy: { scheduledAt: "asc" }
      })
    );
  },
  getDue(now: Date) {
    return dbCall(() =>
      prisma.publicationJob.findMany({
        where: {
          status: "PENDING",
          scheduledAt: { lte: now }
        },
        include: { content: true, socialConnection: true }
      })
    );
  }
};
