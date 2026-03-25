import { ContentItem, contentTypeLabels } from '@/data/mockData';
import { StatusBadge } from './StatusBadge';
import { LanguageBadge } from './LanguageBadge';
import { Eye, Pencil, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ContentCard({ item }: { item: ContentItem }) {
  const navigate = useNavigate();

  return (
    <div className="group rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {contentTypeLabels[item.tipo]}
          </p>
          <h3 className="font-display text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
            {item.titulo}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageBadge language={item.idioma} />
          <StatusBadge status={item.estado} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.texto}</p>

      {item.fecha && (
        <p className="text-xs text-muted-foreground mb-3">{item.fecha}</p>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/contenido/${item.id}`)}>
          <Eye className="h-3.5 w-3.5 mr-1" /> Ver
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/contenido/${item.id}`)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigator.clipboard.writeText(item.texto)}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
        </Button>
        {item.estado === 'listo' && (
          <Button variant="default" size="sm" className="h-7 px-2 text-xs ml-auto">
            <Send className="h-3.5 w-3.5 mr-1" /> Publicar
          </Button>
        )}
      </div>
    </div>
  );
}
