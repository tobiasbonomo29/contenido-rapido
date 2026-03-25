import { Prisma } from "@prisma/client";
import { templateRepo } from "../repositories/template.repo";
import { AppError } from "../utils/errors";

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export const templateService = {
  list() {
    return templateRepo.list();
  },
  async getById(id: string) {
    const template = await templateRepo.getById(id);
    if (!template) {
      throw new AppError("Template not found", 404);
    }
    return template;
  },
  create(data: { name: string; contentType: string; description: string; defaultStructure: Record<string, unknown> }) {
    return templateRepo.create({
      name: data.name,
      contentType: data.contentType as never,
      description: data.description,
      defaultStructure: toJson(data.defaultStructure)
    });
  },
  update(id: string, data: Partial<{ name: string; contentType: string; description: string; defaultStructure: Record<string, unknown> }>) {
    return templateRepo.update(id, {
      name: data.name,
      contentType: data.contentType as never,
      description: data.description,
      defaultStructure: data.defaultStructure ? toJson(data.defaultStructure) : undefined
    });
  },
  delete(id: string) {
    return templateRepo.delete(id);
  }
};
