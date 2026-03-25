import { env } from "../../config/env";
import { MockVideoProvider } from "./mock-video.provider";
import { OpenAiVideoProvider } from "./openai-video.provider";
import { SupportedVideoProvider, VideoProvider } from "./types";

function resolveProviderName(): SupportedVideoProvider {
  if (env.videoProvider === "openai") {
    return "openai";
  }

  if (env.videoProvider === "mock") {
    return "mock";
  }

  return env.openAiApiKey ? "openai" : "mock";
}

let providerInstance: VideoProvider | null = null;

export function getVideoProvider() {
  if (!providerInstance) {
    const resolvedProvider = resolveProviderName();
    if (resolvedProvider === "openai" && !env.openAiApiKey) {
      throw new Error("OPENAI_API_KEY is required when VIDEO_PROVIDER=openai");
    }

    providerInstance =
      resolvedProvider === "openai" ? new OpenAiVideoProvider(env.openAiApiKey) : new MockVideoProvider();
  }

  return providerInstance;
}

export function getResolvedVideoProviderName() {
  return getVideoProvider().name;
}
