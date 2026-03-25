import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, BarChart3, BookOpen, MessageCircleQuestion, Clock, FileText } from 'lucide-react';

const templates = [
  {
    tipo: 'sabias-que',
    label: '¿Sabías que?',
    icon: HelpCircle,
    description: 'Dato sorprendente + contexto breve. Ideal para generar curiosidad y engagement rápido.',
    example: '"¿Sabías que el 70% del agua dulce está en glaciares?"',
    color: 'bg-status-idea-bg text-status-idea',
  },
  {
    tipo: 'infografia',
    label: 'Infografía',
    icon: BarChart3,
    description: 'Comentario breve acompañando una visualización de datos. Perfecto para compartir estadísticas.',
    example: '"PIB per cápita en América Latina 2025 — Panamá lidera con $17,400"',
    color: 'bg-status-ready-bg text-status-ready',
  },
  {
    tipo: 'autor-libro',
    label: 'Autor y libro',
    icon: BookOpen,
    description: 'Idea clave de un libro o autor relevante. Posiciona como curador de conocimiento.',
    example: '"Kahneman nos enseña que tenemos dos sistemas de pensamiento..."',
    color: 'bg-status-published-bg text-status-published',
  },
  {
    tipo: 'quiz',
    label: 'Quiz',
    icon: MessageCircleQuestion,
    description: 'Pregunta estructurada con opciones. Genera interacción y debate en la audiencia.',
    example: '"¿Cuál país tiene las mayores reservas de litio del mundo?"',
    color: 'bg-lang-en-bg text-lang-en',
  },
  {
    tipo: 'historia',
    label: 'Historia',
    icon: Clock,
    description: 'Narrativa corta con lección actual. Conecta pasado con presente de forma memorable.',
    example: '"En 1904, Estados Unidos retomó la construcción del Canal de Panamá..."',
    color: 'bg-lang-es-bg text-lang-es',
  },
  {
    tipo: 'analisis',
    label: 'Análisis',
    icon: FileText,
    description: 'Comentario basado en artículo o reporte. Demuestra pensamiento crítico y expertise.',
    example: '"El 40% de empleos en LATAM son susceptibles a la automatización por IA"',
    color: 'bg-muted text-muted-foreground',
  },
];

export default function Templates() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Plantillas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Usa plantillas para crear contenido de calidad en minutos
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.tipo} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${t.color} mb-4`}>
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-card-foreground mb-1">{t.label}</h3>
              <p className="text-xs text-muted-foreground mb-3 flex-1">{t.description}</p>
              <div className="rounded-lg bg-muted p-3 mb-4">
                <p className="text-xs text-muted-foreground italic">{t.example}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/contenido/nuevo')}
              >
                Usar plantilla
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
