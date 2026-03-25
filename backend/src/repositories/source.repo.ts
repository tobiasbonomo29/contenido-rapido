import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const sourceRepo = {
  list() {
    return prisma.source.findMany({ orderBy: { createdAt: "desc" } });
  },
  create(data: Prisma.SourceCreateInput) {
    return prisma.source.create({ data });
  },
  update(id: string, data: Prisma.SourceUpdateInput) {
    return prisma.source.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.source.delete({ where: { id } });
  }
};
