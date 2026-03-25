import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const videoRepo = {
  create(data: Prisma.VideoGenerationCreateInput) {
    return prisma.videoGeneration.create({ data });
  },
  getById(id: string) {
    return prisma.videoGeneration.findUnique({ where: { id } });
  },
  getByContent(contentId: string) {
    return prisma.videoGeneration.findMany({
      where: { contentId },
      orderBy: { createdAt: "desc" }
    });
  },
  update(id: string, data: Prisma.VideoGenerationUpdateInput) {
    return prisma.videoGeneration.update({ where: { id }, data });
  }
};
