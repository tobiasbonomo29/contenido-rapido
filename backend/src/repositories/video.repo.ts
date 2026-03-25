import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { dbCall } from "../utils/db";

export const videoRepo = {
  create(data: Prisma.VideoGenerationCreateInput) {
    return dbCall(() =>
      prisma.videoGeneration.create({
        data,
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  },
  getById(id: string) {
    return dbCall(() =>
      prisma.videoGeneration.findUnique({
        where: { id },
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  },
  getByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoGeneration.findMany({
        where: { contentId },
        orderBy: { createdAt: "desc" },
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  },
  getActive() {
    return dbCall(() =>
      prisma.videoGeneration.findMany({
        where: {
          status: {
            in: ["PENDING", "PROCESSING"]
          }
        },
        orderBy: { createdAt: "asc" },
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  },
  getLatestActiveByContent(contentId: string) {
    return dbCall(() =>
      prisma.videoGeneration.findFirst({
        where: {
          contentId,
          status: {
            in: ["PENDING", "PROCESSING"]
          }
        },
        orderBy: { createdAt: "desc" },
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  },
  update(id: string, data: Prisma.VideoGenerationUpdateInput) {
    return dbCall(() =>
      prisma.videoGeneration.update({
        where: { id },
        data,
        include: {
          content: true,
          videoDraft: true
        }
      })
    );
  }
};
