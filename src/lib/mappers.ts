import { ContentItem, ContentLanguage, ContentStatus, ContentType } from "@/data/mockData";
import { normalizeApiAssetUrl } from "@/lib/api";

export type ApiContent = {
  id: string;
  title: string;
  objective: string;
  topic: string;
  contentType: string;
  bodyText: string;
  source: string;
  imageUrl?: string | null;
  status: string;
  language: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  metrics?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

const contentTypeMap: Record<string, ContentType> = {
  DID_YOU_KNOW: "sabias-que",
  INFOGRAPHIC: "infografia",
  AUTHOR_BOOK: "autor-libro",
  QUIZ: "quiz",
  HISTORY: "historia",
  ANALYSIS: "analisis",
  DAILY_HEADLINES: "analisis"
};

const reverseContentTypeMap: Record<ContentType, string> = {
  "sabias-que": "DID_YOU_KNOW",
  infografia: "INFOGRAPHIC",
  "autor-libro": "AUTHOR_BOOK",
  quiz: "QUIZ",
  historia: "HISTORY",
  analisis: "ANALYSIS"
};

const statusMap: Record<string, ContentStatus> = {
  IDEA: "idea",
  DRAFT: "borrador",
  READY: "listo",
  PUBLISHED: "publicado"
};

const reverseStatusMap: Record<ContentStatus, string> = {
  idea: "IDEA",
  borrador: "DRAFT",
  listo: "READY",
  publicado: "PUBLISHED"
};

const languageMap: Record<string, ContentLanguage> = {
  ES: "es",
  EN: "en"
};

const reverseLanguageMap: Record<ContentLanguage, string> = {
  es: "ES",
  en: "EN"
};

export function toContentItem(content: ApiContent): ContentItem {
  return {
    id: content.id,
    titulo: content.title,
    objetivo: content.objective,
    tema: content.topic,
    tipo: contentTypeMap[content.contentType] || "analisis",
    texto: content.bodyText,
    fuente: content.source,
    imagen: normalizeApiAssetUrl(content.imageUrl) || undefined,
    estado: statusMap[content.status] || "idea",
    idioma: languageMap[content.language] || "es",
    fecha: content.scheduledAt || content.publishedAt || content.createdAt,
    metricas: undefined
  };
}

export function toApiContentInput(item: ContentItem) {
  return {
    title: item.titulo,
    objective: item.objetivo,
    topic: item.tema,
    contentType: reverseContentTypeMap[item.tipo],
    bodyText: item.texto,
    source: item.fuente,
    imageUrl: normalizeApiAssetUrl(item.imagen) || undefined,
    status: reverseStatusMap[item.estado],
    language: reverseLanguageMap[item.idioma],
    scheduledAt: item.fecha ? new Date(item.fecha).toISOString() : undefined
  };
}

export function toApiFilters(filters: {
  search?: string;
  contentType?: ContentType;
  status?: ContentStatus;
  language?: ContentLanguage;
}) {
  return {
    search: filters.search,
    contentType: filters.contentType ? reverseContentTypeMap[filters.contentType] : undefined,
    status: filters.status ? reverseStatusMap[filters.status] : undefined,
    language: filters.language ? reverseLanguageMap[filters.language] : undefined
  };
}
