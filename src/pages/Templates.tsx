import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, BarChart3, BookOpen, MessageCircleQuestion, Clock, FileText } from 'lucide-react';
import { api } from '@/lib/api';

const iconMap: Record<string, typeof HelpCircle> = {
  DID_YOU_KNOW: HelpCircle,
  INFOGRAPHIC: BarChart3,
  AUTHOR_BOOK: BookOpen,
  QUIZ: MessageCircleQuestion,
  HISTORY: Clock,
  ANALYSIS: FileText,
  DAILY_HEADLINES: FileText
};

const labelMap: Record<string, string> = {
  DID_YOU_KNOW: '¿Sabías que?',
  INFOGRAPHIC: 'Infografía',
  AUTHOR_BOOK: 'Autor y libro',
  QUIZ: 'Quiz',
  HISTORY: 'Historia',
  ANALYSIS: 'Análisis',
  DAILY_HEADLINES: 'Titulares'
};

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await api.getTemplates();
        setTemplates(data);
      } catch (_err) {
        setTemplates([]);
      }
    }

    loadTemplates();
  }, []);

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
          {templates.map((t) => {
            const Icon = iconMap[t.contentType] || FileText;
            return (
              <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted text-muted-foreground mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-card-foreground mb-1">
                  {t.name || labelMap[t.contentType] || t.contentType}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{t.description}</p>
                <div className="rounded-lg bg-muted p-3 mb-4">
                  <p className="text-xs text-muted-foreground italic">{JSON.stringify(t.defaultStructure)}</p>
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
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
