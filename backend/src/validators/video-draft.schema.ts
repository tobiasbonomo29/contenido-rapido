import { z } from "zod";

const videoDraftStatusEnum = z.enum([
  "DRAFT",
  "SCRIPT_READY",
  "PREVIEW_READY",
  "APPROVED",
  "RENDERED",
  "SCHEDULED",
  "PUBLISHED"
]);

const subtitleSegmentSchema = z.object({
  index: z.number().int().positive(),
  text: z.string().min(1)
});

const sceneDirectionSchema = z.object({
  index: z.number().int().positive(),
  sceneTitle: z.string().min(1),
  narration: z.string().min(1),
  visualDirection: z.string().min(1),
  onScreenText: z.string().min(1)
});

const draftSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1)
});

export const generateVideoDraftSchema = z.object({
  params: z.object({
    contentId: z.string().uuid()
  })
});

export const videoDraftByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const videoDraftsByContentSchema = z.object({
  params: z.object({
    contentId: z.string().uuid()
  })
});

export const updateVideoDraftSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z
    .object({
      formatProfile: z.record(z.any()).optional(),
      hook: z.string().min(1).optional(),
      sections: z.array(draftSectionSchema).optional(),
      fullScript: z.string().min(1).optional(),
      subtitlesText: z.string().min(1).optional(),
      subtitlesSegments: z.array(subtitleSegmentSchema).optional(),
      voiceoverText: z.string().min(1).optional(),
      visualPrompt: z.string().min(1).optional(),
      sceneDirections: z.array(sceneDirectionSchema).optional(),
      brandingHints: z.record(z.any()).optional().nullable(),
      targetDurationSeconds: z.number().int().positive().optional(),
      targetAspectRatio: z.string().min(3).optional(),
      voiceStyle: z.string().min(1).optional(),
      visualStyle: z.string().min(1).optional()
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required"
    })
});

export const approveVideoDraftSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const updateVideoDraftStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: videoDraftStatusEnum
  })
});
