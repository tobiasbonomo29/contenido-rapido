import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ContentCard } from '@/components/ContentCard';
import { CheckCircle2, Lightbulb, Send, FileText, Clock, Clapperboard, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, ApiPublicationJob, ApiVideoGeneration } from '@/lib/api';
import { ApiContent, toContentItem } from '@/lib/mappers';

const publicationPlatformLabels = {
  LINKEDIN: 'LinkedIn',
  FACEBOOK: 'Facebook'
} as const;

const videoStatusLabels: Record<ApiVideoGeneration['status'], string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Fallido'
};

function formatPublicationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [readyContent, setReadyContent] = useState<ApiContent[]>([]);
  const [ideas, setIdeas] = useState<ApiContent[]>([]);
  const [drafts, setDrafts] = useState<ApiContent[]>([]);
  const [published, setPublished] = useState<ApiContent[]>([]);
  const [upcomingPublications, setUpcomingPublications] = useState<ApiPublicationJob[]>([]);
  const [recentVideos, setRecentVideos] = useState<ApiVideoGeneration[]>([]);
  const [counts, setCounts] = useState({ listo: 0, idea: 0, publicado: 0, total: 0 });
  const [videoCounts, setVideoCounts] = useState({ activos: 0, completados: 0, fallidos: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [contents, summary] = await Promise.all([
          api.getContents(),
          api.getDashboardSummary()
        ]);

        const allContents = contents as ApiContent[];
        const ready = allContents.filter((item) => item.status === 'READY');
        const idea = allContents.filter((item) => item.status === 'IDEA');
        const draft = allContents.filter((item) => item.status === 'DRAFT');
        const publishedItems = allContents.filter((item) => item.status === 'PUBLISHED');

        setReadyContent(ready);
        setIdeas(idea);
        setDrafts(draft);
        setPublished(publishedItems);
        setUpcomingPublications(summary.upcomingScheduledPublications);
        setRecentVideos(summary.recentVideoGenerations);

        setCounts({
          listo: ready.length,
          idea: idea.length + draft.length,
          publicado: publishedItems.length,
          total: allContents.length
        });

        setVideoCounts({
          activos: summary.videoGenerationCounts.pending + summary.videoGenerationCounts.processing,
          completados: summary.videoGenerationCounts.completed,
          fallidos: summary.videoGenerationCounts.failed
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard');
      }
    }

    loadDashboard();
  }, []);

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

        {error && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Listo para publicar', icon: CheckCircle2, color: 'text-status-ready', bgColor: 'bg-status-ready-bg', value: counts.listo },
            { label: 'Banco de ideas', icon: Lightbulb, color: 'text-status-idea', bgColor: 'bg-status-idea-bg', value: counts.idea },
            { label: 'Publicado', icon: Send, color: 'text-status-published', bgColor: 'bg-status-published-bg', value: counts.publicado },
            { label: 'Total', icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted', value: counts.total },
            { label: 'Videos activos', icon: Clapperboard, color: 'text-primary', bgColor: 'bg-primary/10', value: videoCounts.activos },
            { label: 'Errores de IA', icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10', value: videoCounts.fallidos },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${card.bgColor} mb-2`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-card-foreground">{card.value}</p>
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
                <ContentCard key={item.id} item={toContentItem(item)} />
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
            {[...ideas, ...drafts].map((item) => (
              <ContentCard key={item.id} item={toContentItem(item)} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Pipeline de video</h2>
            <p className="text-xs text-muted-foreground">
              {videoCounts.completados} completados
            </p>
          </div>
          {recentVideos.length > 0 ? (
            <div className="grid gap-3">
              {recentVideos.map((video) => (
                <div key={video.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold text-card-foreground">
                      {video.content?.title || 'Contenido'}
                    </p>
                    <span className="text-xs text-muted-foreground">{video.provider}</span>
                    <span className={`text-xs ${video.status === 'FAILED' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {videoStatusLabels[video.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(video.updatedAt)}</span>
                  </div>
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      Abrir video
                    </a>
                  )}
                  {video.errorMessage && (
                    <p className="mt-2 text-xs text-destructive">{video.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Todavia no hay ejecuciones de video.</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Publicaciones programadas</h2>
          </div>
          {upcomingPublications.length > 0 ? (
            <div className="grid gap-3">
              {upcomingPublications.map((job) => (
                <div key={job.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold text-card-foreground">{job.content?.title || 'Contenido'}</p>
                    <span className="text-xs text-muted-foreground">{publicationPlatformLabels[job.platform]}</span>
                    <span className="text-xs text-muted-foreground">{formatPublicationDate(job.scheduledAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No hay publicaciones programadas.</p>
            </div>
          )}
        </section>

        {/* Published */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Publicaciones realizadas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item) => (
              <ContentCard key={item.id} item={toContentItem(item)} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
