import dotenv from "dotenv";

dotenv.config();

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function resolveVideoProvider(value: string | undefined) {
  if (value === "openai" || value === "mock" || value === "auto") {
    return value;
  }

  return "auto";
}

function parseCsv(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  appBaseUrl: process.env.APP_BASE_URL || `http://localhost:${port}`,
  frontendAppUrl: process.env.FRONTEND_APP_URL || "http://localhost:8084",
  videoProvider: resolveVideoProvider(process.env.VIDEO_PROVIDER),
  videoAutoGenerateOnApproval: parseBoolean(process.env.VIDEO_AUTO_GENERATE_ON_APPROVAL, true),
  videoSyncMinAgeMs: process.env.VIDEO_SYNC_MIN_AGE_MS ? Number(process.env.VIDEO_SYNC_MIN_AGE_MS) : 5000,
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiVideoModel: process.env.OPENAI_VIDEO_MODEL || "sora-2",
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || "",
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  linkedinRedirectUri:
    process.env.LINKEDIN_REDIRECT_URI || `${process.env.APP_BASE_URL || `http://localhost:${port}`}/api/social-connections/oauth/linkedin/callback`,
  linkedinApiVersion: process.env.LINKEDIN_API_VERSION || "202602",
  linkedinScopes: parseCsv(process.env.LINKEDIN_SCOPES, [
    "openid",
    "profile",
    "email",
    "w_member_social",
    "w_organization_social",
    "rw_organization_admin"
  ]),
  facebookAppId: process.env.FACEBOOK_APP_ID || "",
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET || "",
  facebookRedirectUri:
    process.env.FACEBOOK_REDIRECT_URI || `${process.env.APP_BASE_URL || `http://localhost:${port}`}/api/social-connections/oauth/facebook/callback`,
  facebookGraphVersion: process.env.FACEBOOK_GRAPH_VERSION || "v23.0",
  facebookScopes: parseCsv(process.env.FACEBOOK_SCOPES, [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "pages_manage_metadata",
    "publish_video"
  ])
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}
