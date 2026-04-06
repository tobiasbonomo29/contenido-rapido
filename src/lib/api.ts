const DEFAULT_API_URL = "https://contenido-rapido-api-staging.onrender.com/api";
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const API_ORIGIN = new URL(API_URL).origin;

const TOKEN_KEY = "pcms_token";

export type ApiPublicationPlatform = "LINKEDIN" | "FACEBOOK";
export type ApiPublicationStatus = "PENDING" | "SENT" | "FAILED" | "CANCELED";
export type ApiSocialConnectionStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "ERROR" | "DISCONNECTED";
export type ApiSocialAccountType = "MEMBER" | "ORGANIZATION" | "PAGE";
export type ApiVideoDraftStatus = "DRAFT" | "SCRIPT_READY" | "PREVIEW_READY" | "APPROVED" | "RENDERED" | "SCHEDULED" | "PUBLISHED";
export type ApiVideoStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ApiVideoDraft = {
  id: string;
  contentId: string;
  hook: string;
  fullScript: string;
  subtitlesText: string;
  voiceoverText: string;
  visualPrompt: string;
  targetDurationSeconds: number;
  targetAspectRatio: string;
  voiceStyle: string;
  visualStyle: string;
  status: ApiVideoDraftStatus;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiVideoGeneration = {
  id: string;
  contentId: string;
  videoDraftId?: string | null;
  provider: string;
  externalJobId?: string | null;
  status: ApiVideoStatus;
  videoUrl?: string | null;
  errorMessage?: string | null;
  subtitlesText?: string | null;
  voiceoverText?: string | null;
  providerMetadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  content?: {
    id: string;
    title: string;
    status: string;
  };
  videoDraft?: {
    id: string;
    status: string;
  } | null;
};

export type ApiPublicationJob = {
  id: string;
  contentId: string;
  platform: ApiPublicationPlatform;
  socialConnectionId?: string | null;
  scheduledAt: string;
  status: ApiPublicationStatus;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  content?: {
    id: string;
    title: string;
    status: string;
  };
  socialConnection?: {
    id: string;
    accountName: string;
    accountType: ApiSocialAccountType;
    platform: ApiPublicationPlatform;
  } | null;
};

export type ApiSocialConnection = {
  id: string;
  platform: ApiPublicationPlatform;
  accountType: ApiSocialAccountType;
  accountId: string;
  accountUrn?: string | null;
  accountName: string;
  status: ApiSocialConnectionStatus;
  accessTokenExpiresAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorIssue = {
  path?: Array<string | number>;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function formatErrorMessage(payload: { message?: string; errors?: unknown } | null) {
  const message = payload?.message || "Request failed";
  if (!Array.isArray(payload?.errors) || payload.errors.length === 0) {
    return message;
  }

  const [firstIssue] = payload.errors as ApiErrorIssue[];
  if (!firstIssue?.message) {
    return message;
  }

  const fieldPath = Array.isArray(firstIssue.path)
    ? firstIssue.path.filter((segment) => segment !== "body").join(".")
    : "";

  return fieldPath ? `${message}: ${fieldPath} - ${firstIssue.message}` : `${message}: ${firstIssue.message}`;
}

export function normalizeApiAssetUrl(value?: string | null) {
  if (!value) {
    return value;
  }

  try {
    return new URL(value).toString();
  } catch (_error) {
    if (value.startsWith("/")) {
      return new URL(value, API_ORIGIN).toString();
    }

    return value;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
  const payload = isJsonResponse ? await response.json() : null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(formatErrorMessage(payload), response.status, payload?.errors);
  }

  return payload.data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  me() {
    return request<{ id: string; email: string; name?: string }>("/auth/me");
  },
  getContents(params?: Record<string, string | undefined>) {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value && value !== "undefined")
        )
      : undefined;
    const query = cleanParams ? `?${new URLSearchParams(cleanParams).toString()}` : "";
    return request<unknown[]>(`/contents${query}`);
  },
  getContent(id: string) {
    return request<unknown>(`/contents/${id}`);
  },
  createContent(body: unknown) {
    return request<unknown>("/contents", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  updateContent(id: string, body: unknown) {
    return request<unknown>(`/contents/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },
  updateContentStatus(id: string, status: string) {
    return request<unknown>(`/contents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },
  duplicateContent(id: string) {
    return request<unknown>(`/contents/${id}/duplicate`, { method: "POST" });
  },
  getTemplates() {
    return request<unknown[]>("/templates");
  },
  getSources() {
    return request<unknown[]>("/sources");
  },
  getDashboardSummary() {
    return request<{
      readyToPublishCount: number;
      ideaCount: number;
      draftCount: number;
      publishedCount: number;
      videoGenerationCounts: {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
      };
      recentContent: unknown[];
      recentVideoGenerations: ApiVideoGeneration[];
      upcomingScheduledPublications: ApiPublicationJob[];
    }>("/dashboard/summary");
  },
  getPublications(contentId?: string) {
    const query = contentId ? `?${new URLSearchParams({ contentId }).toString()}` : "";
    return request<ApiPublicationJob[]>(`/publications${query}`);
  },
  getSocialConnections(platform?: ApiPublicationPlatform) {
    const query = platform ? `?${new URLSearchParams({ platform }).toString()}` : "";
    return request<ApiSocialConnection[]>(`/social-connections${query}`);
  },
  startSocialOAuth(provider: "linkedin" | "facebook") {
    return request<{ authUrl: string }>(`/social-connections/oauth/${provider}/start`, {
      method: "POST"
    });
  },
  disconnectSocialConnection(id: string) {
    return request<ApiSocialConnection>(`/social-connections/${id}`, {
      method: "DELETE"
    });
  },
  getVideoDrafts(contentId: string) {
    return request<ApiVideoDraft[]>(`/video-drafts/content/${contentId}`);
  },
  generateVideoDraft(contentId: string) {
    return request<ApiVideoDraft>(`/video-drafts/generate/${contentId}`, {
      method: "POST"
    });
  },
  approveVideoDraft(id: string) {
    return request<ApiVideoDraft>(`/video-drafts/${id}/approve`, {
      method: "PATCH"
    });
  },
  getVideos(contentId: string) {
    return request<ApiVideoGeneration[]>(`/videos/content/${contentId}`);
  },
  generateVideo(contentId: string) {
    return request<ApiVideoGeneration>(`/videos/generate/${contentId}`, {
      method: "POST"
    });
  },
  schedulePublication(body: {
    contentId: string;
    platform: ApiPublicationPlatform;
    scheduledAt: string;
    socialConnectionId?: string;
  }) {
    return request<ApiPublicationJob>("/publications/schedule", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  cancelPublication(id: string) {
    return request<ApiPublicationJob>(`/publications/${id}/cancel`, {
      method: "PATCH"
    });
  },
  async uploadImage(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData
    });

    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      throw new ApiError(formatErrorMessage(payload), response.status, payload.errors);
    }

    return {
      ...(payload.data as { imageUrl: string; fileName: string }),
      imageUrl: normalizeApiAssetUrl(payload.data.imageUrl) || ""
    };
  }
};
