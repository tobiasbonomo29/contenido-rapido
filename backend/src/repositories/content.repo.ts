import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { dbCall } from "../utils/db";

export type ContentFilters = {
  search?: string;
  contentType?: string;
  status?: string;
  language?: string;
};

export const contentRepo = {
  async list(filters: ContentFilters) {
    const where: Prisma.ContentWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { topic: { contains: filters.search, mode: "insensitive" } },
        { bodyText: { contains: filters.search, mode: "insensitive" } },
        { objective: { contains: filters.search, mode: "insensitive" } },
        { source: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (filters.contentType) {
      where.contentType = filters.contentType as Prisma.ContentWhereInput["contentType"];
    }

    if (filters.status) {
      where.status = filters.status as Prisma.ContentWhereInput["status"];
    }

    if (filters.language) {
      where.language = filters.language as Prisma.ContentWhereInput["language"];
    }

    return dbCall(() =>
      prisma.content.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { createdBy: true }
      })
    );
  },
  getById(id: string) {
    return dbCall(() =>
      prisma.content.findUnique({
        where: { id },
        include: { createdBy: true }
      })
    );
  },
  create(data: Prisma.ContentCreateInput) {
    return dbCall(() => prisma.content.create({ data }));
  },
  update(id: string, data: Prisma.ContentUpdateInput) {
    return dbCall(() => prisma.content.update({ where: { id }, data }));
  },
  delete(id: string) {
    return dbCall(() => prisma.content.delete({ where: { id } }));
  }
};
