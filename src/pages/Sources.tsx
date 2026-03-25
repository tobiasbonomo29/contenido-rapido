import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ExternalLink, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';

export default function Sources() {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getSources();
        setSources(data);
      } catch (_err) {
        setSources([]);
      }
    }

    loadSources();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Fuentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fuentes curadas para investigación y creación de contenido
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Bookmark className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-semibold text-card-foreground flex items-center gap-1.5">
                  {source.name}
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{source.category}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <Bookmark className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Próximamente: agrega tus propias fuentes personalizadas</p>
        </div>
      </div>
    </AppLayout>
  );
}
