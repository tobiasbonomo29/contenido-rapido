import { prisma } from "../config/prisma";
import { Prisma, VideoDraftStatus } from "@prisma/client";
import { dbCall } from "../utils/db";

export const videoDraftRepo = {
  create(data: Prisma.VideoDraftCreateInput) {
    return dbCall(() =>
      prisma.videoDraft.create({
        data,
        include: { content: true }
      })
    );
  },
  getById(id: string) {
    return dbCall(() =>
      prisma.videoDraft.findUnique({
        where: { id },
        include: { content: true }
      })
    );
  },
  getByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoDraft.findMany({
        where: { contentId },
        orderBy: { createdAt: "desc" },
        include: { content: true }
      })
    );
  },
  update(id: string, data: Prisma.VideoDraftUpdateInput) {
    return dbCall(() =>
      prisma.videoDraft.update({
        where: { id },
        data,
        include: { content: true }
      })
    );
  },
  hasAnyByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoDraft.count({
        where: { contentId }
      })
    );
  },
  hasApprovedByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoDraft.count({
        where: {
          contentId,
          status: "APPROVED"
        }
      })
    );
  },
  getLatestApprovedByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoDraft.findFirst({
        where: {
          contentId,
          status: "APPROVED"
        },
        orderBy: { approvedAt: "desc" }
      })
    );
  },
  updateStatus(id: string, status: VideoDraftStatus, approvedAt?: Date | null) {
    return dbCall(() =>
      prisma.videoDraft.update({
        where: { id },
        data: { status, approvedAt },
        include: { content: true }
      })
    );
  }
};
