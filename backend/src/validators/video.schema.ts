import { z } from "zod";

export const generateVideoSchema = z.object({
  params: z.object({
    contentId: z.string().uuid()
  })
});
