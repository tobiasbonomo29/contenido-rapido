import { ContentType, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createVideoDraftBlueprint } from "../src/services/video-draft-builder";

const prisma = new PrismaClient();

const templateSeeds = [
  {
    id: "f4f18cf8-99cc-4129-90ef-87d2f33d1011",
    name: "Did You Know",
    contentType: "DID_YOU_KNOW" as const,
    description: "Short fact-based storytelling with a surprising insight.",
    defaultStructure: {
      hook: "Sabias que...",
      fact: "Dato principal",
      context: "Contexto breve",
      close: "Impacto final"
    }
  },
  {
    id: "758d55bf-e5ec-4b58-a756-c34c7a8b0ed2",
    name: "Infographic Explainer",
    contentType: "INFOGRAPHIC" as const,
    description: "Visual explanation with animated points and a conclusion.",
    defaultStructure: {
      hook: "Dato o insight principal",
      pointOne: "Punto 1",
      pointTwo: "Punto 2",
      close: "Conclusion"
    }
  },
  {
    id: "0d433fb5-4f3d-465b-9e47-eb0c76419170",
    name: "Author Book Story",
    contentType: "AUTHOR_BOOK" as const,
    description: "Narrative educational storytelling inspired by a book idea.",
    defaultStructure: {
      hook: "Idea que atrapa",
      centralIdea: "Tesis del libro",
      relevance: "Por que importa",
      close: "Reflexion final"
    }
  },
  {
    id: "4fd84b16-4631-4d9f-bde0-1e6ff4f3f4d1",
    name: "Quiz Reveal",
    contentType: "QUIZ" as const,
    description: "Question, suspense and reveal for short-form quiz videos.",
    defaultStructure: {
      question: "Pregunta",
      options: "Opciones",
      suspense: "Pausa dramatica",
      reveal: "Respuesta",
      close: "Explicacion breve"
    }
  },
  {
    id: "7a02ae5a-8a24-4ef7-ac3c-7550457f808a",
    name: "Historical Timeline",
    contentType: "HISTORY" as const,
    description: "Historical storytelling with context, turning point and conclusion.",
    defaultStructure: {
      context: "Contexto",
      turningPoint: "Punto de giro",
      transformation: "Transformacion",
      close: "Conclusion"
    }
  },
  {
    id: "9fe42dca-1fa0-4478-a1a4-8ec74649afef",
    name: "Analysis",
    contentType: "ANALYSIS" as const,
    description: "Analytical explainer with hook, explanation and implication.",
    defaultStructure: {
      hook: "Hook",
      keyIdea: "Idea central",
      explanation: "Explicacion",
      implication: "Implicancia"
    }
  },
  {
    id: "e8a83001-60db-4674-a17f-6cbd8358adf1",
    name: "Daily Headlines",
    contentType: "DAILY_HEADLINES" as const,
    description: "Rapid news summary format for short updates.",
    defaultStructure: {
      intro: "Intro",
      headlineOne: "Headline 1",
      headlineTwo: "Headline 2",
      headlineThree: "Headline 3",
      close: "Closing"
    }
  }
];

const sourceSeeds = [
  {
    id: "69f63a7f-b1cb-43aa-a9cc-1f49239f86d6",
    name: "Our World in Data",
    url: "https://ourworldindata.org",
    category: "Data"
  },
  {
    id: "f4cc8fd2-42ac-4edf-a6d0-1d6f2436928e",
    name: "Visual Capitalist",
    url: "https://www.visualcapitalist.com",
    category: "Infographics"
  },
  {
    id: "8fd1eef3-4e6a-45b4-93da-75852d71bfdd",
    name: "World Bank",
    url: "https://www.worldbank.org",
    category: "Economy"
  },
  {
    id: "7df94c12-2450-4cfa-b5f1-c879835a8094",
    name: "IMF",
    url: "https://www.imf.org",
    category: "Economy"
  }
];

const contentSeeds = [
  {
    id: "c69728fb-15bc-40f5-8b12-ddf9b81e38b1",
    title: "Sabias que el calor urbano puede subir 7 grados",
    objective: "Concientizar sobre el impacto de las islas de calor",
    topic: "Cambio climatico",
    contentType: "DID_YOU_KNOW" as ContentType,
    bodyText:
      "Las ciudades densas pueden registrar hasta 7 grados mas que las zonas rurales cercanas. El asfalto y la falta de arbolado concentran el calor, elevan el consumo energetico y empeoran la calidad de vida.",
    source: "Our World in Data",
    status: "DRAFT" as const,
    language: "ES" as const
  },
  {
    id: "2680ef64-c9dd-45ba-9ab3-31c164f5bf41",
    title: "Infografia: como se reparte el consumo electrico en un hogar",
    objective: "Explicar visualmente que aparatos consumen mas energia",
    topic: "Energia domestica",
    contentType: "INFOGRAPHIC" as ContentType,
    bodyText:
      "La climatizacion concentra gran parte del consumo, seguida por cocina y lavado. Entender la distribucion permite priorizar mejoras de eficiencia y reducir la factura mensual.",
    source: "Visual Capitalist",
    status: "READY" as const,
    language: "ES" as const
  },
  {
    id: "c4c5e8af-cbf0-4088-8737-bf9e43c1b8b6",
    title: "Atomic Habits y la fuerza de las mejoras pequenas",
    objective: "Transformar una idea de libro en una reflexion accionable",
    topic: "Habitos",
    contentType: "AUTHOR_BOOK" as ContentType,
    bodyText:
      "James Clear plantea que las mejoras del uno por ciento no parecen grandes en el dia a dia, pero cambian por completo los resultados en el largo plazo. El sistema importa mas que la motivacion inicial.",
    source: "Libro: Atomic Habits",
    status: "READY" as const,
    language: "ES" as const
  },
  {
    id: "f6f2ef64-eb5d-4970-8cd6-2fa022401f98",
    title: "Que pais tiene mas reservas de litio?",
    objective: "Generar engagement con una pregunta de recursos naturales",
    topic: "Litio",
    contentType: "QUIZ" as ContentType,
    bodyText:
      "A) Chile B) Australia C) Bolivia D) Argentina\n\nRespuesta: Bolivia. El pais concentra las mayores reservas identificadas, aunque la capacidad de explotacion y refinado depende de inversion e infraestructura.",
    source: "USGS",
    status: "READY" as const,
    language: "ES" as const
  },
  {
    id: "5959c8ac-4af4-4931-a12f-e4ba14cca9b1",
    title: "La historia del Canal de Panama en cuatro momentos",
    objective: "Contar una historia historica con giro estrategico",
    topic: "Infraestructura",
    contentType: "HISTORY" as ContentType,
    bodyText:
      "El proyecto frances fracaso por dificultades tecnicas y sanitarias. A comienzos del siglo XX Estados Unidos retomo la obra, reorganizo el sistema de esclusas y transformo para siempre el comercio maritimo mundial.",
    source: "Smithsonian",
    status: "READY" as const,
    language: "ES" as const
  },
  {
    id: "e5716d23-c776-403a-af65-87f2877b0b33",
    title: "Por que la eficiencia energetica sigue siendo subestimada",
    objective: "Explicar por que la eficiencia tiene impacto economico inmediato",
    topic: "Energia",
    contentType: "ANALYSIS" as ContentType,
    bodyText:
      "La eficiencia energetica puede reducir costos operativos hasta un 30 por ciento en industrias con alto consumo. Aun asi, muchas empresas la postergan porque miran el gasto inicial y no el retorno de mediano plazo.",
    source: "IMF",
    status: "READY" as const,
    language: "ES" as const
  },
  {
    id: "21e0f976-c4bf-41d4-a31e-3de080b94d64",
    title: "Three signals shaping markets this morning",
    objective: "Summarize daily headlines in a fast format",
    topic: "Global markets",
    contentType: "DAILY_HEADLINES" as ContentType,
    bodyText:
      "Oil prices rose after supply concerns returned. Asian equities opened mixed while investors waited for inflation data. In the United States, bond yields eased ahead of the Federal Reserve comments.",
    source: "Financial press briefing",
    status: "READY" as const,
    language: "EN" as const
  }
];

const draftIdsByContentId: Record<string, string> = {
  "c69728fb-15bc-40f5-8b12-ddf9b81e38b1": "5d9f8e7d-9fb4-41db-892a-b873ae50f4d1",
  "2680ef64-c9dd-45ba-9ab3-31c164f5bf41": "d86b6bc5-f7df-4e67-96e1-55a11cb375d0",
  "c4c5e8af-cbf0-4088-8737-bf9e43c1b8b6": "078b3648-aa98-48db-bddb-59edeb39db63",
  "f6f2ef64-eb5d-4970-8cd6-2fa022401f98": "5f9c93b5-b09f-4d8a-91b8-4c38d044b7fc",
  "5959c8ac-4af4-4931-a12f-e4ba14cca9b1": "b9277674-e307-48d8-b113-47911b6c1f5d",
  "e5716d23-c776-403a-af65-87f2877b0b33": "c0cae43d-b159-4ef3-ab01-afd8e3bdbf41",
  "21e0f976-c4bf-41d4-a31e-3de080b94d64": "7dfcc372-3acc-45d5-8cce-0d9dc9db4e7c"
};

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@pcms.local" },
    update: {},
    create: {
      email: "demo@pcms.local",
      name: "Demo User",
      passwordHash
    }
  });

  for (const template of templateSeeds) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        contentType: template.contentType,
        description: template.description,
        defaultStructure: template.defaultStructure
      },
      create: template
    });
  }

  for (const source of sourceSeeds) {
    await prisma.source.upsert({
      where: { id: source.id },
      update: {
        name: source.name,
        url: source.url,
        category: source.category
      },
      create: source
    });
  }

  for (const content of contentSeeds) {
    await prisma.content.upsert({
      where: { id: content.id },
      update: {
        title: content.title,
        objective: content.objective,
        topic: content.topic,
        contentType: content.contentType,
        bodyText: content.bodyText,
        source: content.source,
        status: content.status,
        language: content.language,
        createdById: demoUser.id
      },
      create: {
        ...content,
        createdById: demoUser.id
      }
    });
  }

  const seededContents = await prisma.content.findMany({
    where: {
      id: { in: contentSeeds.map((content) => content.id) }
    }
  });

  for (const content of seededContents) {
    const blueprint = createVideoDraftBlueprint({
      id: content.id,
      title: content.title,
      objective: content.objective,
      topic: content.topic,
      contentType: content.contentType,
      bodyText: content.bodyText,
      source: content.source,
      imageUrl: content.imageUrl,
      language: content.language
    });

    await prisma.videoDraft.upsert({
      where: { id: draftIdsByContentId[content.id] },
      update: {
        formatProfile: blueprint.formatProfile,
        hook: blueprint.hook,
        sections: blueprint.sections,
        fullScript: blueprint.fullScript,
        subtitlesText: blueprint.subtitlesText,
        subtitlesSegments: blueprint.subtitlesSegments,
        voiceoverText: blueprint.voiceoverText,
        visualPrompt: blueprint.visualPrompt,
        sceneDirections: blueprint.sceneDirections,
        brandingHints: blueprint.brandingHints,
        targetDurationSeconds: blueprint.targetDurationSeconds,
        targetAspectRatio: blueprint.targetAspectRatio,
        voiceStyle: blueprint.voiceStyle,
        visualStyle: blueprint.visualStyle,
        status: content.status === "READY" ? "APPROVED" : blueprint.status,
        approvedAt: content.status === "READY" ? new Date() : null
      },
      create: {
        id: draftIdsByContentId[content.id],
        contentId: content.id,
        formatProfile: blueprint.formatProfile,
        hook: blueprint.hook,
        sections: blueprint.sections,
        fullScript: blueprint.fullScript,
        subtitlesText: blueprint.subtitlesText,
        subtitlesSegments: blueprint.subtitlesSegments,
        voiceoverText: blueprint.voiceoverText,
        visualPrompt: blueprint.visualPrompt,
        sceneDirections: blueprint.sceneDirections,
        brandingHints: blueprint.brandingHints,
        targetDurationSeconds: blueprint.targetDurationSeconds,
        targetAspectRatio: blueprint.targetAspectRatio,
        voiceStyle: blueprint.voiceStyle,
        visualStyle: blueprint.visualStyle,
        status: content.status === "READY" ? "APPROVED" : blueprint.status,
        approvedAt: content.status === "READY" ? new Date() : null
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
