import { ContentType, Language } from "@prisma/client";
import { BrandingHints, getVideoFormatProfile, VideoFormatProfile } from "../config/video-format.config";

export type DraftContentInput = {
  id: string;
  title: string;
  objective: string;
  topic: string;
  contentType: ContentType;
  bodyText: string;
  source: string;
  imageUrl?: string | null;
  language: Language;
};

export type DraftSection = {
  key: string;
  title: string;
  text: string;
};

export type SubtitleSegment = {
  index: number;
  text: string;
};

export type SceneDirection = {
  index: number;
  sceneTitle: string;
  narration: string;
  visualDirection: string;
  onScreenText: string;
};

export type VideoDraftBlueprint = {
  contentId: string;
  contentType: ContentType;
  formatProfile: VideoFormatProfile;
  hook: string;
  sections: DraftSection[];
  fullScript: string;
  subtitlesText: string;
  subtitlesSegments: SubtitleSegment[];
  voiceoverText: string;
  visualPrompt: string;
  sceneDirections: SceneDirection[];
  targetDurationSeconds: number;
  targetAspectRatio: string;
  voiceStyle: string;
  visualStyle: string;
  brandingHints: BrandingHints;
  status: "SCRIPT_READY";
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function splitIntoSentences(value: string) {
  const normalized = value
    .split(/\r?\n/)
    .map((chunk) => normalizeText(chunk))
    .filter(Boolean)
    .flatMap((chunk) => chunk.split(/(?<=[.!?])\s+/))
    .map((chunk) => normalizeText(chunk))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : [normalizeText(value)];
}

function limitWords(value: string, maxWords: number) {
  const words = normalizeText(value).split(" ");
  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

function ensureSentence(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function lowerFirst(value: string) {
  if (!value) return value;
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function languageCopy(language: Language) {
  const isSpanish = language === "ES";

  return {
    and: isSpanish ? "y" : "and",
    thisMatters: isSpanish ? "Esto importa porque" : "This matters because",
    keyIdea: isSpanish ? "La idea central es esta" : "The core idea is this",
    context: isSpanish ? "El contexto clave es el siguiente" : "The key context is this",
    finalImpact: isSpanish ? "El impacto final es claro" : "The final impact is clear",
    reflection: isSpanish ? "La reflexion final es simple" : "The closing reflection is simple",
    thinkAboutIt: isSpanish ? "Pensalo un segundo antes de ver la respuesta" : "Take a second before the answer appears",
    answerIs: isSpanish ? "La respuesta es" : "The answer is",
    today: isSpanish ? "hoy" : "today",
    followCta: isSpanish ? "Segui para mas ideas como esta" : "Follow for more ideas like this",
    source: isSpanish ? "Fuente" : "Source"
  };
}

function buildHook(content: DraftContentInput) {
  const copy = languageCopy(content.language);
  const title = ensureSentence(limitWords(content.title, 12));

  switch (content.contentType) {
    case "QUIZ":
      return /[?؟]$/.test(content.title.trim())
        ? content.title.trim()
        : content.language === "ES"
        ? `Pregunta rapida: ${title}`
        : `Quick question: ${title}`;
    case "DAILY_HEADLINES":
      return content.language === "ES"
        ? `Estas son las noticias clave sobre ${lowerFirst(content.topic)}.`
        : `These are the key headlines about ${lowerFirst(content.topic)}.`;
    case "DID_YOU_KNOW":
      return content.language === "ES"
        ? `Sabias que ${lowerFirst(limitWords(content.title, 12))}`
        : `Did you know ${lowerFirst(limitWords(content.title, 12))}`;
    default:
      return title;
  }
}

function extractQuizOptions(content: DraftContentInput, sentences: string[]) {
  const matches = content.bodyText.match(/[A-D][\)\.]\s*([^\n]+)/g) || [];
  if (matches.length > 0) {
    return matches.map((match) => normalizeText(match));
  }

  return sentences.slice(0, 3).map((sentence, index) => `${String.fromCharCode(65 + index)}) ${limitWords(sentence, 8)}`);
}

function extractQuizAnswer(content: DraftContentInput, sentences: string[]) {
  const explicitAnswer = content.bodyText.match(/respuesta\s*:\s*([^\n]+)/i) || content.bodyText.match(/answer\s*:\s*([^\n]+)/i);
  if (explicitAnswer?.[1]) {
    return normalizeText(explicitAnswer[1]);
  }

  return sentences[0] || ensureSentence(content.objective);
}

function buildSections(content: DraftContentInput, sentences: string[]): DraftSection[] {
  const copy = languageCopy(content.language);
  const primary = ensureSentence(limitWords(sentences[0] || content.bodyText, 22));
  const secondary = ensureSentence(limitWords(sentences[1] || content.objective, 22));
  const tertiary = ensureSentence(limitWords(sentences[2] || `${copy.thisMatters} ${lowerFirst(content.objective)}`, 22));

  switch (content.contentType) {
    case "DID_YOU_KNOW":
      return [
        { key: "fact", title: "Fact", text: primary },
        { key: "context", title: "Context", text: content.language === "ES" ? `${copy.context}: ${secondary}` : `${copy.context}: ${secondary}` },
        { key: "impact", title: "Impact", text: content.language === "ES" ? `${copy.finalImpact}: ${tertiary}` : `${copy.finalImpact}: ${tertiary}` }
      ];
    case "INFOGRAPHIC":
      return [
        { key: "point_1", title: "Point 1", text: primary },
        { key: "point_2", title: "Point 2", text: secondary },
        {
          key: "conclusion",
          title: "Conclusion",
          text: content.language === "ES"
            ? `${copy.keyIdea}: ${limitWords(content.objective, 16)}.`
            : `${copy.keyIdea}: ${limitWords(content.objective, 16)}.`
        }
      ];
    case "AUTHOR_BOOK":
      return [
        { key: "book_idea", title: "Book idea", text: primary },
        {
          key: "why_it_matters",
          title: "Why it matters",
          text: content.language === "ES"
            ? `${copy.thisMatters} ${lowerFirst(limitWords(content.objective, 18))}.`
            : `${copy.thisMatters} ${lowerFirst(limitWords(content.objective, 18))}.`
        },
        {
          key: "closing_reflection",
          title: "Closing reflection",
          text: content.language === "ES"
            ? `${copy.reflection}: ${tertiary}`
            : `${copy.reflection}: ${tertiary}`
        }
      ];
    case "QUIZ": {
      const options = extractQuizOptions(content, sentences);
      const answer = extractQuizAnswer(content, sentences);
      return [
        { key: "options", title: "Options", text: options.join(" ") },
        { key: "suspense", title: "Suspense", text: ensureSentence(copy.thinkAboutIt) },
        { key: "reveal", title: "Reveal", text: ensureSentence(`${copy.answerIs}: ${answer}`) },
        { key: "explanation", title: "Explanation", text: secondary }
      ];
    }
    case "HISTORY":
      return [
        { key: "context", title: "Context", text: primary },
        { key: "turning_point", title: "Turning point", text: secondary },
        { key: "transformation", title: "Transformation", text: tertiary },
        {
          key: "conclusion",
          title: "Conclusion",
          text: content.language === "ES"
            ? `${copy.finalImpact}: ${limitWords(content.objective, 18)}.`
            : `${copy.finalImpact}: ${limitWords(content.objective, 18)}.`
        }
      ];
    case "ANALYSIS":
      return [
        {
          key: "key_idea",
          title: "Key idea",
          text: content.language === "ES"
            ? `${copy.keyIdea}: ${primary}`
            : `${copy.keyIdea}: ${primary}`
        },
        { key: "explanation", title: "Explanation", text: secondary },
        {
          key: "implication",
          title: "Implication",
          text: content.language === "ES"
            ? `${copy.thisMatters} ${lowerFirst(limitWords(content.objective, 18))}.`
            : `${copy.thisMatters} ${lowerFirst(limitWords(content.objective, 18))}.`
        }
      ];
    case "DAILY_HEADLINES":
      return [
        { key: "headline_1", title: "Headline 1", text: primary },
        { key: "headline_2", title: "Headline 2", text: secondary },
        { key: "headline_3", title: "Headline 3", text: tertiary },
        {
          key: "closing",
          title: "Closing",
          text: content.language === "ES"
            ? `${copy.followCta}.`
            : `${copy.followCta}.`
        }
      ];
    default:
      return [];
  }
}

function buildSubtitleSegments(lines: string[]) {
  const segments: SubtitleSegment[] = [];
  let index = 1;

  for (const line of lines) {
    const words = normalizeText(line).split(" ");
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > 42 || next.split(" ").length > 7) {
        if (current) {
          segments.push({ index, text: current });
          index += 1;
        }
        current = word;
      } else {
        current = next;
      }
    }

    if (current) {
      segments.push({ index, text: current });
      index += 1;
    }
  }

  return segments;
}

function buildSceneDirections(
  content: DraftContentInput,
  profile: VideoFormatProfile,
  hook: string,
  sections: DraftSection[]
) {
  const scriptLines = [hook, ...sections.map((section) => section.text)];
  const visualAnchor = content.imageUrl
    ? "Use the uploaded image as a visual anchor when possible."
    : "Create original branded visuals guided by the scene text.";

  return scriptLines.map((line, index) => ({
    index: index + 1,
    sceneTitle: index === 0 ? "Hook" : sections[index - 1].title,
    narration: line,
    onScreenText: limitWords(line, 10),
    visualDirection: `${profile.visualStyle}. ${visualAnchor} Focus on ${lowerFirst(content.topic)} and keep a ${profile.targetAspectRatio} composition.`
  }));
}

function buildVisualPrompt(
  content: DraftContentInput,
  profile: VideoFormatProfile,
  hook: string,
  sections: DraftSection[]
) {
  const copy = languageCopy(content.language);
  const scriptSummary = [hook, ...sections.map((section) => section.text)].join(" ");

  return [
    `Create a ${profile.format} video about ${content.topic}.`,
    `Visual style: ${profile.visualStyle}.`,
    `Voice style reference: ${profile.voiceStyle}.`,
    `Aspect ratio: ${profile.targetAspectRatio}.`,
    `Key narrative: ${limitWords(scriptSummary, 45)}`,
    `${copy.source}: ${content.source}.`
  ].join(" ");
}

export function createVideoDraftBlueprint(content: DraftContentInput): VideoDraftBlueprint {
  const profile = getVideoFormatProfile(content.contentType);
  const sentences = splitIntoSentences(content.bodyText);
  const hook = ensureSentence(buildHook(content));
  const sections = buildSections(content, sentences);
  const scriptLines = [hook, ...sections.map((section) => section.text)];
  const fullScript = scriptLines.join("\n\n");

  return {
    contentId: content.id,
    contentType: content.contentType,
    formatProfile: profile,
    hook,
    sections,
    fullScript,
    subtitlesText: fullScript,
    subtitlesSegments: buildSubtitleSegments(scriptLines),
    voiceoverText: fullScript,
    visualPrompt: buildVisualPrompt(content, profile, hook, sections),
    sceneDirections: buildSceneDirections(content, profile, hook, sections),
    targetDurationSeconds: profile.targetDurationSeconds,
    targetAspectRatio: profile.targetAspectRatio,
    voiceStyle: profile.voiceStyle,
    visualStyle: profile.visualStyle,
    brandingHints: profile.brandingHints,
    status: "SCRIPT_READY"
  };
}
