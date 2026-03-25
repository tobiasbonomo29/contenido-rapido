import { Prisma } from "@prisma/client";
import { contentRepo } from "../repositories/content.repo";
import { AppError } from "../utils/errors";

type Status = "IDEA" | "DRAFT" | "READY" | "PUBLISHED";

type ContentInput = {
  title: string;
  objective: string;
  topic: string;
  contentType: string;
  bodyText: string;
  source: string;
  imageUrl?: string | null;
  status?: Status;
  language: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  metrics?: Record<string, unknown> | null;
};

function toJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function canTransition(current: Status, next: Status) {
  if (current === next) return true;
  if (current === "IDEA" && next === "DRAFT") return true;
  if (current === "DRAFT" && next === "READY") return true;
  if (current === "READY" && next === "PUBLISHED") return true;
  return false;
}

export const contentService = {
  list(filters: { search?: string; contentType?: string; status?: string; language?: string }) {
    return contentRepo.list(filters);
  },
  async getById(id: string) {
    const content = await contentRepo.getById(id);
    if (!content) {
      throw new AppError("Content not found", 404);
    }
    return content;
  },
  async create(data: ContentInput, createdById: string) {
    const status = data.status || "IDEA";

    return contentRepo.create({
      title: data.title,
      objective: data.objective,
      topic: data.topic,
      contentType: data.contentType as never,
      bodyText: data.bodyText,
      source: data.source,
      imageUrl: data.imageUrl || undefined,
      status,
      language: data.language as never,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      metrics: data.metrics ? toJson(data.metrics) : undefined,
      createdBy: { connect: { id: createdById } }
    });
  },
  async update(id: string, data: Partial<ContentInput>) {
    const existing = await contentRepo.getById(id);
    if (!existing) {
      throw new AppError("Content not found", 404);
    }

    if (data.status && !canTransition(existing.status, data.status)) {
      throw new AppError("Invalid status transition", 400);
    }

    const nextPublishedAt =
      data.status === "PUBLISHED" && !existing.publishedAt
        ? new Date()
        : data.publishedAt
        ? new Date(data.publishedAt)
        : undefined;

    return contentRepo.update(id, {
      title: data.title,
      objective: data.objective,
      topic: data.topic,
      contentType: data.contentType as never,
      bodyText: data.bodyText,
      source: data.source,
      imageUrl: data.imageUrl === null ? null : data.imageUrl,
      status: data.status as never,
      language: data.language as never,
      scheduledAt: data.scheduledAt === null ? null : data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      publishedAt: nextPublishedAt,
      metrics: data.metrics === null ? Prisma.JsonNull : data.metrics ? toJson(data.metrics) : undefined
    });
  },
  async updateStatus(id: string, status: Status) {
    const existing = await contentRepo.getById(id);
    if (!existing) {
      throw new AppError("Content not found", 404);
    }

    if (!canTransition(existing.status, status)) {
      throw new AppError("Invalid status transition", 400);
    }

    const publishedAt = status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined;
    return contentRepo.update(id, { status, publishedAt });
  },
  delete(id: string) {
    return contentRepo.delete(id);
  },
  async duplicate(id: string) {
    const existing = await contentRepo.getById(id);
    if (!existing) {
      throw new AppError("Content not found", 404);
    }

    return contentRepo.create({
      title: existing.title,
      objective: existing.objective,
      topic: existing.topic,
      contentType: existing.contentType,
      bodyText: existing.bodyText,
      source: existing.source,
      imageUrl: existing.imageUrl || undefined,
      status: "DRAFT",
      language: existing.language,
      metrics: existing.metrics ? toJson(existing.metrics) : undefined,
      createdBy: { connect: { id: existing.createdById } }
    });
  }
};
