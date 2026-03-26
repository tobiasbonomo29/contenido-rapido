import { z } from "zod";

const platformEnum = z.enum(["LINKEDIN", "FACEBOOK"]);

export const schedulePublicationSchema = z.object({
  body: z.object({
    contentId: z.string().uuid(),
    platform: platformEnum,
    scheduledAt: z.string().datetime(),
    socialConnectionId: z.string().uuid().optional()
  })
});
