import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { contentTypeLabels, ContentType, ContentStatus, ContentLanguage } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { LanguageBadge } from '@/components/LanguageBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, CheckCircle2, Copy, Eye, CalendarClock, XCircle, Wand2, Clapperboard, RefreshCw } from 'lucide-react';
import { api, ApiPublicationJob, ApiPublicationPlatform, ApiVideoDraft, ApiVideoGeneration } from '@/lib/api';
import { ApiContent, toApiContentInput, toContentItem } from '@/lib/mappers';

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

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

const publicationPlatformLabels: Record<ApiPublicationPlatform, string> = {
  LINKEDIN: 'LinkedIn',
  FACEBOOK: 'Facebook'
};

const publicationStatusLabels: Record<ApiPublicationJob['status'], string> = {
  PENDING: 'Pendiente',
  SENT: 'Enviado',
  FAILED: 'Fallido',
  CANCELED: 'Cancelado'
};

const videoDraftStatusLabels: Record<ApiVideoDraft['status'], string> = {
  DRAFT: 'Borrador',
  SCRIPT_READY: 'Guion listo',
  PREVIEW_READY: 'Preview listo',
  APPROVED: 'Aprobado',
  RENDERED: 'Renderizado',
  SCHEDULED: 'Programado',
  PUBLISHED: 'Publicado'
};

const videoStatusLabels: Record<ApiVideoGeneration['status'], string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Completado',
  FAILED: 'Fallido'
};

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'nuevo';
  const [existing, setExisting] = useState<ApiContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [titulo, setTitulo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [tema, setTema] = useState('');
  const [tipo, setTipo] = useState<ContentType>('sabias-que');
  const [texto, setTexto] = useState('');
  const [fuente, setFuente] = useState('');
  const [estado, setEstado] = useState<ContentStatus>('idea');
  const [idioma, setIdioma] = useState<ContentLanguage>('es');
  const [fecha, setFecha] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [schedulePlatform, setSchedulePlatform] = useState<ApiPublicationPlatform>('LINKEDIN');
  const [scheduleAt, setScheduleAt] = useState('');
  const [publicationJobs, setPublicationJobs] = useState<ApiPublicationJob[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [videoDrafts, setVideoDrafts] = useState<ApiVideoDraft[]>([]);
  const [videos, setVideos] = useState<ApiVideoGeneration[]>([]);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isApprovingDraft, setIsApprovingDraft] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const loadPublicationJobs = async (contentId: string) => {
    const jobs = await api.getPublications(contentId);
    setPublicationJobs(jobs);
  };

  const loadVideoDrafts = async (contentId: string) => {
    const drafts = await api.getVideoDrafts(contentId);
    setVideoDrafts(drafts);
    return drafts;
  };

  const loadVideos = async (contentId: string) => {
    const nextVideos = await api.getVideos(contentId);
    setVideos(nextVideos);
    return nextVideos;
  };

  const latestVideoDraft = videoDrafts[0] ?? null;
  const hasActiveVideos = videos.some((video) => video.status === 'PENDING' || video.status === 'PROCESSING');

  useEffect(() => {
    async function loadContent() {
      if (isNew || !id) return;
      try {
        const data = (await api.getContent(id)) as ApiContent;
        setExisting(data);

        const mapped = toContentItem(data);
        setTitulo(mapped.titulo);
        setObjetivo(mapped.objetivo);
        setTema(mapped.tema);
        setTipo(mapped.tipo);
        setTexto(mapped.texto);
        setFuente(mapped.fuente);
        setEstado(mapped.estado);
        setIdioma(mapped.idioma);
        setFecha(mapped.fecha ? mapped.fecha.slice(0, 10) : '');
        setImageUrl(mapped.imagen || '');
        setScheduleAt(toDateTimeLocalValue(data.scheduledAt));
        await Promise.all([loadPublicationJobs(id), loadVideoDrafts(id), loadVideos(id)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el contenido');
      }
    }

    loadContent();
  }, [id, isNew]);

  useEffect(() => {
    if (!id || isNew || !hasActiveVideos) {
      return;
    }

    const interval = window.setInterval(() => {
      loadVideos(id).catch(() => undefined);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [hasActiveVideos, id, isNew]);

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!titulo.trim()) nextErrors.titulo = 'El titulo es obligatorio';
    if (!objetivo.trim()) nextErrors.objetivo = 'El objetivo es obligatorio';
    if (!tema.trim()) nextErrors.tema = 'El tema es obligatorio';
    if (!texto.trim()) nextErrors.texto = 'El texto es obligatorio';
    if (!fuente.trim()) nextErrors.fuente = 'La fuente es obligatoria';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError('Completa los campos requeridos');
      return;
    }

    setIsSaving(true);
    setError('');
    setFieldErrors({});

    const payload = toApiContentInput({
      id: id || '',
      titulo,
      objetivo,
      tema,
      tipo,
      texto,
      fuente,
      imagen: imageUrl || undefined,
      estado,
      idioma,
      fecha,
    });

    try {
      if (isNew) {
        const created = (await api.createContent(payload)) as ApiContent;
        navigate(`/contenido/${created.id}`);
      } else if (id) {
        await api.updateContent(id, payload);
        const refreshed = (await api.getContent(id)) as ApiContent;
        setExisting(refreshed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const result = await api.uploadImage(file);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!id) return;
    try {
      if (estado === 'idea') {
        await api.updateContentStatus(id, 'DRAFT');
      }
      await api.updateContentStatus(id, 'READY');
      setEstado('listo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado');
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const duplicated = (await api.duplicateContent(id)) as ApiContent;
    navigate(`/contenido/${duplicated.id}`);
  };

  const refreshContent = async (contentId: string) => {
    const refreshed = (await api.getContent(contentId)) as ApiContent;
    setExisting(refreshed);
    setScheduleAt(toDateTimeLocalValue(refreshed.scheduledAt));
    setFecha(refreshed.scheduledAt ? refreshed.scheduledAt.slice(0, 10) : '');
    return refreshed;
  };

  const handleSchedulePublication = async () => {
    if (!id || !scheduleAt) return;

    setIsScheduling(true);
    setError('');

    try {
      await api.schedulePublication({
        contentId: id,
        platform: schedulePlatform,
        scheduledAt: new Date(scheduleAt).toISOString()
      });

      await Promise.all([refreshContent(id), loadPublicationJobs(id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo programar la publicacion');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelPublication = async (jobId: string) => {
    if (!id) return;

    setError('');

    try {
      await api.cancelPublication(jobId);
      await Promise.all([refreshContent(id), loadPublicationJobs(id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la publicacion');
    }
  };

  const handleGenerateVideoDraft = async () => {
    if (!id) return;

    setIsGeneratingDraft(true);
    setError('');

    try {
      await api.generateVideoDraft(id);
      await loadVideoDrafts(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el draft de video');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleApproveVideoDraft = async (draftId: string) => {
    if (!id) return;

    setIsApprovingDraft(true);
    setError('');

    try {
      await api.approveVideoDraft(draftId);
      await Promise.all([loadVideoDrafts(id), loadVideos(id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar el draft de video');
    } finally {
      setIsApprovingDraft(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!id) return;

    setIsGeneratingVideo(true);
    setError('');

    try {
      await api.generateVideo(id);
      await loadVideos(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

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
                {fieldErrors.titulo && <p className="text-xs text-destructive">{fieldErrors.titulo}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="¿Qué busca esta publicación?" />
                  {fieldErrors.objetivo && <p className="text-xs text-destructive">{fieldErrors.objetivo}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej: Economía, Tecnología" />
                  {fieldErrors.tema && <p className="text-xs text-destructive">{fieldErrors.tema}</p>}
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
                      <SelectItem value="borrador">Borrador</SelectItem>
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
                {fieldErrors.texto && <p className="text-xs text-destructive">{fieldErrors.texto}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fuente</Label>
                  <Input value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="Fuente de la información" />
                  {fieldErrors.fuente && <p className="text-xs text-destructive">{fieldErrors.fuente}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Imagen</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
                {isUploading && <p className="text-xs text-muted-foreground">Subiendo imagen...</p>}
                {imageUrl && (
                  <img src={imageUrl} alt="Vista previa" className="mt-2 rounded-lg border border-border max-h-48 object-cover" />
                )}
              </div>
            </div>

            {/* Metrics placeholder */}
            {existing?.metrics && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-sm font-semibold text-card-foreground mb-3">Métricas</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{(existing.metrics as any)?.likes ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{(existing.metrics as any)?.comments ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Comentarios</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-card-foreground">{(existing.metrics as any)?.shares ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Compartidos</p>
                  </div>
                </div>
              </div>
            )}

            {!isNew && id && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold text-card-foreground">Pipeline de video AI</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 px-2 text-xs"
                    onClick={() => Promise.all([loadVideoDrafts(id), loadVideos(id)])}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Actualizar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleGenerateVideoDraft} disabled={isGeneratingDraft}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGeneratingDraft ? 'Generando draft...' : 'Generar draft'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => latestVideoDraft && handleApproveVideoDraft(latestVideoDraft.id)}
                    disabled={!latestVideoDraft || latestVideoDraft.status === 'APPROVED' || isApprovingDraft}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isApprovingDraft ? 'Aprobando...' : 'Aprobar draft'}
                  </Button>
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={!latestVideoDraft || latestVideoDraft.status !== 'APPROVED' || isGeneratingVideo}
                  >
                    <Clapperboard className="h-4 w-4 mr-2" />
                    {isGeneratingVideo ? 'Generando video...' : 'Generar video AI'}
                  </Button>
                </div>

                {latestVideoDraft ? (
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-card-foreground">{videoDraftStatusLabels[latestVideoDraft.status]}</span>
                      <span>{latestVideoDraft.targetDurationSeconds}s</span>
                      <span>{latestVideoDraft.targetAspectRatio}</span>
                      <span>{latestVideoDraft.visualStyle}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook</p>
                      <p className="text-sm text-card-foreground">{latestVideoDraft.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guion</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6">{latestVideoDraft.fullScript}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Direccion visual</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">{latestVideoDraft.visualPrompt}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Todavia no hay drafts de video para este contenido.</p>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Videos generados</h4>
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-card-foreground">{video.provider}</span>
                          <span>{videoStatusLabels[video.status]}</span>
                          {video.videoDraftId && <span>Draft vinculado</span>}
                        </div>
                        {video.videoUrl ? (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-primary underline underline-offset-4"
                          >
                            Abrir video
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">El asset final todavia no esta disponible.</p>
                        )}
                        {video.errorMessage && <p className="text-xs text-destructive">{video.errorMessage}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay videos generados todavia.</p>
                  )}
                </div>
              </div>
            )}

            {!isNew && id && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold text-card-foreground">Programar publicacion</h3>
                </div>

                {estado !== 'listo' && (
                  <p className="text-xs text-muted-foreground">
                    Primero marca el contenido como listo para habilitar la programacion.
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plataforma</Label>
                    <Select value={schedulePlatform} onValueChange={(value) => setSchedulePlatform(value as ApiPublicationPlatform)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                        <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha y hora</Label>
                    <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                  </div>
                </div>

                <Button onClick={handleSchedulePublication} disabled={isScheduling || estado !== 'listo' || !scheduleAt}>
                  <CalendarClock className="h-4 w-4 mr-2" />
                  {isScheduling ? 'Programando...' : 'Programar publicacion'}
                </Button>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publicaciones</h4>
                  {publicationJobs.length > 0 ? (
                    publicationJobs.map((job) => (
                      <div key={job.id} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-card-foreground">{publicationPlatformLabels[job.platform]}</p>
                          <span className="text-xs text-muted-foreground">{publicationStatusLabels[job.status]}</span>
                          <span className="text-xs text-muted-foreground">{formatPublicationDate(job.scheduledAt)}</span>
                          {job.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 px-2 text-xs"
                              onClick={() => handleCancelPublication(job.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                            </Button>
                          )}
                        </div>
                        {job.errorMessage && (
                          <p className="mt-2 text-xs text-destructive">{job.errorMessage}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay publicaciones programadas todavia.</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="outline" onClick={handleMarkReady}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como listo
              </Button>
              {!isNew && (
                <Button variant="outline" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicar
                </Button>
              )}
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
