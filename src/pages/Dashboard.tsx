import { mockContent } from '@/data/mockData';
import { AppLayout } from '@/components/AppLayout';
import { ContentCard } from '@/components/ContentCard';
import { CheckCircle2, Lightbulb, Send, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const summaryCards = [
  { label: 'Listo para publicar', icon: CheckCircle2, color: 'text-status-ready', bgColor: 'bg-status-ready-bg', key: 'listo' as const },
  { label: 'Banco de ideas', icon: Lightbulb, color: 'text-status-idea', bgColor: 'bg-status-idea-bg', key: 'idea' as const },
  { label: 'Publicado', icon: Send, color: 'text-status-published', bgColor: 'bg-status-published-bg', key: 'publicado' as const },
  { label: 'Total', icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted', key: 'total' as const },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const readyContent = mockContent.filter((c) => c.estado === 'listo');
  const ideas = mockContent.filter((c) => c.estado === 'idea');
  const published = mockContent.filter((c) => c.estado === 'publicado');

  const counts = {
    listo: readyContent.length,
    idea: ideas.length,
    publicado: published.length,
    total: mockContent.length,
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Publica contenido en menos de 5 minutos
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${card.bgColor} mb-2`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-card-foreground">{counts[card.key]}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Ready to publish */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Contenido listo para publicar
            </h2>
            <button
              onClick={() => navigate('/contenido')}
              className="text-sm text-primary font-medium hover:underline"
            >
              Ver todo
            </button>
          </div>
          {readyContent.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {readyContent.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay contenido listo todavía</p>
              <button onClick={() => navigate('/contenido/nuevo')} className="text-sm text-primary font-medium mt-2 hover:underline">
                Crear contenido
              </button>
            </div>
          )}
        </section>

        {/* Ideas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Banco de ideas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Published */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Publicaciones realizadas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
