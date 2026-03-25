import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { mockContent, contentTypeLabels, ContentType, ContentStatus, ContentLanguage } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, CheckCircle2, Copy, Eye } from 'lucide-react';

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'nuevo';
  const existing = !isNew ? mockContent.find((c) => c.id === id) : null;

  const [titulo, setTitulo] = useState(existing?.titulo || '');
  const [objetivo, setObjetivo] = useState(existing?.objetivo || '');
  const [tema, setTema] = useState(existing?.tema || '');
  const [tipo, setTipo] = useState<ContentType>(existing?.tipo || 'sabias-que');
  const [texto, setTexto] = useState(existing?.texto || '');
  const [fuente, setFuente] = useState(existing?.fuente || '');
  const [estado, setEstado] = useState<ContentStatus>(existing?.estado || 'idea');
  const [idioma, setIdioma] = useState<ContentLanguage>(existing?.idioma || 'es');
  const [fecha, setFecha] = useState(existing?.fecha || '');

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {isNew ? 'Nuevo contenido' : 'Editar contenido'}
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del contenido" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="¿Qué busca esta publicación?" />
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej: Economía, Tecnología" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de contenido</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as ContentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(contentTypeLabels) as ContentType[]).map((key) => (
                        <SelectItem key={key} value={key}>{contentTypeLabels[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={(v) => setEstado(v as ContentStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="listo">Listo</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value={idioma} onValueChange={(v) => setIdioma(v as ContentLanguage)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={6} placeholder="Escribe el contenido aquí..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fuente</Label>
                  <Input value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="Fuente de la información" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Metrics placeholder */}
            {existing?.metricas && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-card-foreground mb-3">Métricas</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{existing.metricas.likes}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{existing.metricas.comments}</p>
                    <p className="text-xs text-muted-foreground">Comentarios</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{existing.metricas.shares}</p>
                    <p className="text-xs text-muted-foreground">Compartidos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button><Save className="h-4 w-4 mr-2" /> Guardar</Button>
              <Button variant="outline" onClick={() => setEstado('listo')}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como listo
              </Button>
              <Button variant="outline"><Copy className="h-4 w-4 mr-2" /> Duplicar</Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Vista previa
              </h3>
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden max-w-sm mx-auto lg:mx-0">
                {/* Mock social card */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">RC</div>
                    <div>
                      <p className="text-xs font-semibold text-card-foreground">Roberto Castillo</p>
                      <p className="text-[10px] text-muted-foreground">Analista · {fecha || 'Hoy'}</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <LanguageBadge language={idioma} />
                      <StatusBadge status={estado} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-1">
                      {contentTypeLabels[tipo]}
                    </p>
                    <h4 className="font-display text-sm font-bold text-card-foreground leading-tight mb-2">
                      {titulo || 'Título del contenido'}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                      {texto || 'El texto de tu contenido aparecerá aquí...'}
                    </p>
                  </div>

                  {fuente && (
                    <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
                      Fuente: {fuente}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
