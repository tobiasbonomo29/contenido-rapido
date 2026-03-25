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

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    contentType: contentTypeEnum,
    description: z.string().min(2),
    defaultStructure: z.record(z.any())
  })
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contentType: contentTypeEnum.optional(),
    description: z.string().min(2).optional(),
    defaultStructure: z.record(z.any()).optional()
  })
});
