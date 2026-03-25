export type ContentStatus = 'idea' | 'listo' | 'publicado';
export type ContentLanguage = 'es' | 'en';
export type ContentType = 'sabias-que' | 'infografia' | 'autor-libro' | 'quiz' | 'historia' | 'analisis';

export interface ContentItem {
  id: string;
  titulo: string;
  objetivo: string;
  tema: string;
  tipo: ContentType;
  texto: string;
  fuente: string;
  imagen?: string;
  estado: ContentStatus;
  fecha?: string;
  idioma: ContentLanguage;
  metricas?: { likes: number; comments: number; shares: number };
}

export const contentTypeLabels: Record<ContentType, string> = {
  'sabias-que': '¿Sabías que?',
  'infografia': 'Infografía',
  'autor-libro': 'Autor y libro',
  'quiz': 'Quiz',
  'historia': 'Historia',
  'analisis': 'Análisis',
};

export const statusLabels: Record<ContentStatus, string> = {
  idea: 'Idea',
  listo: 'Listo',
  publicado: 'Publicado',
};

export const mockContent: ContentItem[] = [
  {
    id: '1',
    titulo: '70% del agua dulce del mundo está en glaciares',
    objetivo: 'Generar conciencia sobre recursos hídricos',
    tema: 'Medio ambiente',
    tipo: 'sabias-que',
    texto: '¿Sabías que el 70% del agua dulce del planeta está atrapada en glaciares y capas de hielo? A medida que el cambio climático acelera su derretimiento, enfrentamos una paradoja: más agua disponible a corto plazo, pero escasez severa a largo plazo.',
    fuente: 'Our World in Data',
    estado: 'listo',
    fecha: '2026-03-25',
    idioma: 'es',
  },
  {
    id: '2',
    titulo: 'The rise of renewable energy in Latin America',
    objetivo: 'Position as regional energy analyst',
    tema: 'Energía',
    tipo: 'analisis',
    texto: 'Latin America has seen a 340% increase in solar energy capacity since 2018. Countries like Chile and Brazil are leading the charge, with ambitious targets for 2030.',
    fuente: 'World Bank Report 2025',
    estado: 'listo',
    fecha: '2026-03-26',
    idioma: 'en',
  },
  {
    id: '3',
    titulo: 'Infografía: PIB per cápita en América Latina 2025',
    objetivo: 'Visualizar diferencias económicas regionales',
    tema: 'Economía',
    tipo: 'infografia',
    texto: 'Comparativa visual del PIB per cápita en los 10 principales países de América Latina. Panamá lidera con $17,400 USD seguido por Chile con $16,800 USD.',
    fuente: 'FMI - Perspectivas Económicas 2025',
    estado: 'listo',
    idioma: 'es',
  },
  {
    id: '4',
    titulo: '"Pensar rápido, pensar despacio" - Daniel Kahneman',
    objetivo: 'Compartir frameworks de pensamiento',
    tema: 'Psicología / Toma de decisiones',
    tipo: 'autor-libro',
    texto: 'Kahneman nos enseña que tenemos dos sistemas de pensamiento: el rápido (intuitivo) y el lento (analítico). La mayoría de nuestros errores de juicio vienen de confiar demasiado en el sistema rápido.',
    fuente: 'Libro: Thinking, Fast and Slow (2011)',
    estado: 'idea',
    idioma: 'es',
  },
  {
    id: '5',
    titulo: '¿Cuál país tiene más reservas de litio?',
    objetivo: 'Engagement a través de quiz interactivo',
    tema: 'Recursos naturales',
    tipo: 'quiz',
    texto: '¿Cuál país tiene las mayores reservas de litio del mundo?\nA) Chile\nB) Australia\nC) Bolivia\nD) Argentina\n\nRespuesta: C) Bolivia, con 21 millones de toneladas.',
    fuente: 'USGS Mineral Commodity Summaries 2025',
    estado: 'idea',
    idioma: 'es',
  },
  {
    id: '6',
    titulo: 'La historia del Canal de Panamá',
    objetivo: 'Narrativa histórica con lección actual',
    tema: 'Historia / Infraestructura',
    tipo: 'historia',
    texto: 'En 1904, Estados Unidos retomó la construcción del Canal de Panamá tras el fracaso francés. Lo que parecía imposible se logró en 10 años, transformando el comercio global para siempre.',
    fuente: 'Smithsonian Archives',
    estado: 'publicado',
    fecha: '2026-03-20',
    idioma: 'es',
    metricas: { likes: 142, comments: 28, shares: 45 },
  },
  {
    id: '7',
    titulo: 'Did you know? 60% of the world lacks access to safe sanitation',
    objetivo: 'Raise awareness on global sanitation gaps',
    tema: 'Global Health',
    tipo: 'sabias-que',
    texto: 'Did you know that 3.6 billion people — nearly half the world — still lack access to safely managed sanitation? The gap is most severe in Sub-Saharan Africa and South Asia.',
    fuente: 'WHO/UNICEF JMP 2025',
    estado: 'publicado',
    fecha: '2026-03-18',
    idioma: 'en',
    metricas: { likes: 89, comments: 15, shares: 32 },
  },
  {
    id: '8',
    titulo: 'Análisis: El impacto de la IA en el empleo latinoamericano',
    objetivo: 'Posicionarse como analista de tendencias laborales',
    tema: 'Tecnología / Empleo',
    tipo: 'analisis',
    texto: 'Un nuevo informe del BID revela que el 40% de los empleos en América Latina son susceptibles a la automatización por IA en los próximos 10 años. Sin embargo, también se crearán 12 millones de nuevos puestos.',
    fuente: 'BID - Informe Futuro del Trabajo 2025',
    estado: 'idea',
    idioma: 'es',
  },
];

export const sources = [
  { id: '1', nombre: 'Our World in Data', url: 'https://ourworldindata.org', descripcion: 'Datos globales sobre salud, energía, pobreza y más' },
  { id: '2', nombre: 'Visual Capitalist', url: 'https://www.visualcapitalist.com', descripcion: 'Infografías y visualizaciones de datos globales' },
  { id: '3', nombre: 'World Bank', url: 'https://data.worldbank.org', descripcion: 'Indicadores de desarrollo global' },
  { id: '4', nombre: 'FMI', url: 'https://www.imf.org/en/Data', descripcion: 'Datos financieros y económicos mundiales' },
  { id: '5', nombre: 'CEPAL', url: 'https://www.cepal.org', descripcion: 'Comisión Económica para América Latina' },
  { id: '6', nombre: 'Statista', url: 'https://www.statista.com', descripcion: 'Estadísticas y estudios de mercado' },
];
