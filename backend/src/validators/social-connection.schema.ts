import { z } from "zod";

const providerEnum = z.enum(["linkedin", "facebook"]);
const platformEnum = z.enum(["LINKEDIN", "FACEBOOK"]);

export const listSocialConnectionsSchema = z.object({
  query: z.object({
    platform: platformEnum.optional()
  })
});

export const startSocialOAuthSchema = z.object({
  params: z.object({
    provider: providerEnum
  })
});

export const socialOAuthCallbackSchema = z.object({
  params: z.object({
    provider: providerEnum
  }),
  query: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional()
  })
});

export const disconnectSocialConnectionSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
