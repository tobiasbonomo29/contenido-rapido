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

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  appBaseUrl: process.env.APP_BASE_URL || `http://localhost:${port}`,
  videoProvider: resolveVideoProvider(process.env.VIDEO_PROVIDER),
  videoAutoGenerateOnApproval: parseBoolean(process.env.VIDEO_AUTO_GENERATE_ON_APPROVAL, true),
  videoSyncMinAgeMs: process.env.VIDEO_SYNC_MIN_AGE_MS ? Number(process.env.VIDEO_SYNC_MIN_AGE_MS) : 5000,
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiVideoModel: process.env.OPENAI_VIDEO_MODEL || "sora-2"
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}
