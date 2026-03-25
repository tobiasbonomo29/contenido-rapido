import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { dbCall } from "../utils/db";

export const sourceRepo = {
  list() {
    return dbCall(() => prisma.source.findMany({ orderBy: { createdAt: "desc" } }));
  },
  create(data: Prisma.SourceCreateInput) {
    return dbCall(() => prisma.source.create({ data }));
  },
  update(id: string, data: Prisma.SourceUpdateInput) {
    return dbCall(() => prisma.source.update({ where: { id }, data }));
  },
  delete(id: string) {
    return dbCall(() => prisma.source.delete({ where: { id } }));
  }
};
