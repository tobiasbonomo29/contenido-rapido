import { Content } from "@prisma/client";

function isPublicUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname) || parsed.hostname.endsWith(".local")) {
      return false;
    }

    return true;
  } catch (_error) {
    return false;
  }
}

export function resolveShareableUrl(content: Content, videoUrl?: string | null) {
  if (videoUrl && isPublicUrl(videoUrl)) {
    return videoUrl;
  }

  if (content.imageUrl && isPublicUrl(content.imageUrl)) {
    return content.imageUrl;
  }

  return null;
}

export function buildPublicationMessage(content: Content, shareableUrl?: string | null) {
  const lines = [content.title.trim(), "", content.bodyText.trim()];

  if (content.source?.trim()) {
    lines.push("", `Fuente: ${content.source.trim()}`);
  }

  if (shareableUrl) {
    lines.push("", shareableUrl);
  }

  return lines.filter(Boolean).join("\n");
}
