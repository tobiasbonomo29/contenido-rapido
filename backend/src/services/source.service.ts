import { sourceRepo } from "../repositories/source.repo";

export const sourceService = {
  list() {
    return sourceRepo.list();
  },
  create(data: { name: string; url: string; category: string; isActive?: boolean }) {
    return sourceRepo.create({
      name: data.name,
      url: data.url,
      category: data.category,
      isActive: data.isActive ?? true
    });
  },
  update(id: string, data: { name?: string; url?: string; category?: string; isActive?: boolean }) {
    return sourceRepo.update(id, {
      name: data.name,
      url: data.url,
      category: data.category,
      isActive: data.isActive
    });
  },
  delete(id: string) {
    return sourceRepo.delete(id);
  }
};
