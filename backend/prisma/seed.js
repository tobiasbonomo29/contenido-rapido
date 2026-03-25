"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt_1.default.hash("password123", 10);
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@pcms.local" },
        update: {},
        create: {
            email: "demo@pcms.local",
            name: "Demo User",
            passwordHash
        }
    });
    await prisma.template.createMany({
        data: [
            {
                name: "Did You Know",
                contentType: "DID_YOU_KNOW",
                description: "Short fact-based post with a surprising insight.",
                defaultStructure: {
                    hook: "Sabias que...",
                    body: "Dato principal con contexto.",
                    close: "Pregunta para engagement"
                }
            },
            {
                name: "Analysis",
                contentType: "ANALYSIS",
                description: "Analisis breve con datos y conclusion.",
                defaultStructure: {
                    context: "Contexto y tendencia",
                    insight: "Insight clave",
                    action: "Recomendacion"
                }
            }
        ],
        skipDuplicates: true
    });
    await prisma.source.createMany({
        data: [
            {
                name: "Our World in Data",
                url: "https://ourworldindata.org",
                category: "Data"
            },
            {
                name: "Visual Capitalist",
                url: "https://www.visualcapitalist.com",
                category: "Infographics"
            },
            {
                name: "World Bank",
                url: "https://www.worldbank.org",
                category: "Economy"
            },
            {
                name: "IMF",
                url: "https://www.imf.org",
                category: "Economy"
            }
        ],
        skipDuplicates: true
    });
    await prisma.content.createMany({
        data: [
            {
                title: "El costo real de la energia",
                objective: "Educar sobre eficiencia energetica",
                topic: "Energia",
                contentType: "ANALYSIS",
                bodyText: "La eficiencia energetica puede reducir costos hasta un 30%...",
                source: "Our World in Data",
                status: "READY",
                language: "ES",
                createdById: demoUser.id,
                metrics: { views: 120, saves: 18 }
            },
            {
                title: "Dato rapido: agua potable",
                objective: "Concientizar sobre acceso al agua",
                topic: "Agua",
                contentType: "DID_YOU_KNOW",
                bodyText: "Mas de 2 mil millones de personas...",
                source: "World Bank",
                status: "DRAFT",
                language: "ES",
                createdById: demoUser.id
            }
        ]
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
