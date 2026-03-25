import { z } from "zod";

export const createSourceSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    url: z.string().url(),
    category: z.string().min(2),
    isActive: z.boolean().optional()
  })
});

export const updateSourceSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    url: z.string().url().optional(),
    category: z.string().min(2).optional(),
    isActive: z.boolean().optional()
  })
});
