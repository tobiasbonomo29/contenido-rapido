import { ContentType } from "@prisma/client";

export type BrandingHints = {
  subtitleStyle: string;
  cta: string;
  logoPresence: boolean;
  coverStyle: string;
};

export type VideoFormatProfile = {
  contentType: ContentType;
  format: string;
  structure: string[];
  durationLabel: string;
  targetDurationSeconds: number;
  targetAspectRatio: string;
  visualStyle: string;
  voiceStyle: string;
  brandingHints: BrandingHints;
};

const baseBrandingHints: BrandingHints = {
  subtitleStyle: "Bold captions, bottom safe-area, high contrast",
  cta: "Segui la cuenta para mas contenido",
  logoPresence: true,
  coverStyle: "Clean branded cover with strong hook"
};

export const videoFormatProfiles: Record<ContentType, VideoFormatProfile> = {
  DID_YOU_KNOW: {
    contentType: "DID_YOU_KNOW",
    format: "short fact storytelling",
    structure: ["hook", "fact", "context", "closing impact"],
    durationLabel: "20-30s",
    targetDurationSeconds: 25,
    targetAspectRatio: "9:16",
    visualStyle: "dynamic educational",
    voiceStyle: "clear, impactful",
    brandingHints: baseBrandingHints
  },
  INFOGRAPHIC: {
    contentType: "INFOGRAPHIC",
    format: "visual explanation",
    structure: ["hook", "point 1", "point 2", "conclusion"],
    durationLabel: "30-45s",
    targetDurationSeconds: 40,
    targetAspectRatio: "1:1",
    visualStyle: "infographic animated",
    voiceStyle: "explanatory",
    brandingHints: baseBrandingHints
  },
  AUTHOR_BOOK: {
    contentType: "AUTHOR_BOOK",
    format: "narrative educational storytelling",
    structure: ["hook", "book idea", "why it matters", "closing reflection"],
    durationLabel: "30-45s",
    targetDurationSeconds: 40,
    targetAspectRatio: "9:16",
    visualStyle: "illustrative storytelling",
    voiceStyle: "narrative, professional",
    brandingHints: baseBrandingHints
  },
  QUIZ: {
    contentType: "QUIZ",
    format: "suspense and reveal",
    structure: ["question", "options", "suspense", "reveal", "explanation"],
    durationLabel: "15-25s",
    targetDurationSeconds: 20,
    targetAspectRatio: "9:16",
    visualStyle: "interactive quiz",
    voiceStyle: "dynamic",
    brandingHints: baseBrandingHints
  },
  HISTORY: {
    contentType: "HISTORY",
    format: "historical storytelling timeline",
    structure: ["context", "turning point", "transformation", "conclusion"],
    durationLabel: "30-45s",
    targetDurationSeconds: 40,
    targetAspectRatio: "9:16",
    visualStyle: "historical narrative",
    voiceStyle: "documentary",
    brandingHints: baseBrandingHints
  },
  ANALYSIS: {
    contentType: "ANALYSIS",
    format: "analytical short explainer",
    structure: ["hook", "key idea", "explanation", "implication"],
    durationLabel: "45-60s",
    targetDurationSeconds: 50,
    targetAspectRatio: "1:1",
    visualStyle: "editorial and professional",
    voiceStyle: "professional, analytical",
    brandingHints: baseBrandingHints
  },
  DAILY_HEADLINES: {
    contentType: "DAILY_HEADLINES",
    format: "rapid news summary",
    structure: ["intro", "headline 1", "headline 2", "headline 3", "closing"],
    durationLabel: "20-35s",
    targetDurationSeconds: 30,
    targetAspectRatio: "9:16",
    visualStyle: "fast news reel",
    voiceStyle: "news-like, neutral",
    brandingHints: baseBrandingHints
  }
};

export function getVideoFormatProfile(contentType: ContentType) {
  return videoFormatProfiles[contentType];
}
