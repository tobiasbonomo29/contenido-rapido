import { z } from "zod";

const contentTypeEnum = z.enum([
  "DID_YOU_KNOW",
  "INFOGRAPHIC",
  "AUTHOR_BOOK",
  "QUIZ",
  "HISTORY",
  "ANALYSIS",
  "DAILY_HEADLINES"
]);

const contentStatusEnum = z.enum(["IDEA", "DRAFT", "READY", "PUBLISHED"]);
const languageEnum = z.enum(["ES", "EN"]);

export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    objective: z.string().min(2),
    topic: z.string().min(2),
    contentType: contentTypeEnum,
    bodyText: z.string().min(2),
    source: z.string().min(2),
    imageUrl: z.string().url().optional(),
    status: contentStatusEnum.optional(),
    language: languageEnum,
    scheduledAt: z.string().datetime().optional(),
    publishedAt: z.string().datetime().optional(),
    metrics: z.record(z.any()).optional()
  })
});

export const updateContentSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    objective: z.string().min(2).optional(),
    topic: z.string().min(2).optional(),
    contentType: contentTypeEnum.optional(),
    bodyText: z.string().min(2).optional(),
    source: z.string().min(2).optional(),
    imageUrl: z.string().url().optional().nullable(),
    status: contentStatusEnum.optional(),
    language: languageEnum.optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    publishedAt: z.string().datetime().optional().nullable(),
    metrics: z.record(z.any()).optional().nullable()
  })
});

export const contentStatusSchema = z.object({
  body: z.object({
    status: contentStatusEnum
  })
});
