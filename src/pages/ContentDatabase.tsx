import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { contentTypeLabels, statusLabels, ContentStatus, ContentType, ContentLanguage } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { ApiContent, toContentItem, toApiFilters } from '@/lib/mappers';

export default function ContentDatabase() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLang, setFilterLang] = useState<string>('all');
  const [contents, setContents] = useState<ApiContent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadContents() {
      try {
        const filters = toApiFilters({
          search: search || undefined,
          contentType: filterType === 'all' ? undefined : (filterType as ContentType),
          status: filterStatus === 'all' ? undefined : (filterStatus as ContentStatus),
          language: filterLang === 'all' ? undefined : (filterLang as ContentLanguage)
        });

        const data = await api.getContents(filters as Record<string, string | undefined>);
        setContents(data as ApiContent[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar contenido');
      }
    }

    loadContents();
  }, [search, filterType, filterStatus, filterLang]);

  const filtered = useMemo(() => {
    return contents.map((item) => toContentItem(item));
  }, [contents]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Contenido</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} publicaciones</p>
          </div>
          <Button onClick={() => navigate('/contenido/nuevo')}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo contenido
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {(Object.keys(contentTypeLabels) as ContentType[]).map((key) => (
                <SelectItem key={key} value={key}>{contentTypeLabels[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(Object.keys(statusLabels) as ContentStatus[]).map((key) => (
                <SelectItem key={key} value={key}>{statusLabels[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table - desktop */}
        <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Idioma</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/contenido/${item.id}`)}
                  className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-card-foreground max-w-xs truncate">{item.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contentTypeLabels[item.tipo]}</td>
                  <td className="px-4 py-3"><LanguageBadge language={item.idioma} /></td>
                  <td className="px-4 py-3"><StatusBadge status={item.estado} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{item.fecha || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No se encontraron resultados
            </div>
          )}
        </div>

        {/* Cards - mobile */}
        <div className="md:hidden space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/contenido/${item.id}`)}
              className="rounded-xl border border-border bg-card p-4 shadow-card cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <LanguageBadge language={item.idioma} />
                <StatusBadge status={item.estado} />
                <span className="text-xs text-muted-foreground ml-auto">{item.fecha || ''}</span>
              </div>
              <h3 className="font-display text-sm font-semibold text-card-foreground">{item.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-1">{contentTypeLabels[item.tipo]}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
