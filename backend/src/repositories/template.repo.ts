import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";
import { dbCall } from "../utils/db";

export const templateRepo = {
  list() {
    return dbCall(() => prisma.template.findMany({ orderBy: { createdAt: "desc" } }));
  },
  getById(id: string) {
    return dbCall(() => prisma.template.findUnique({ where: { id } }));
  },
  create(data: Prisma.TemplateCreateInput) {
    return dbCall(() => prisma.template.create({ data }));
  },
  update(id: string, data: Prisma.TemplateUpdateInput) {
    return dbCall(() => prisma.template.update({ where: { id }, data }));
  },
  delete(id: string) {
    return dbCall(() => prisma.template.delete({ where: { id } }));
  }
};
