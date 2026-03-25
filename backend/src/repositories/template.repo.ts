import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const templateRepo = {
  list() {
    return prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  },
  getById(id: string) {
    return prisma.template.findUnique({ where: { id } });
  },
  create(data: Prisma.TemplateCreateInput) {
    return prisma.template.create({ data });
  },
  update(id: string, data: Prisma.TemplateUpdateInput) {
    return prisma.template.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.template.delete({ where: { id } });
  }
};
