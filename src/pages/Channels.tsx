import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { api, ApiSocialConnection } from '@/lib/api';
import { Share2, Unplug, RefreshCw } from 'lucide-react';

const platformLabels = {
  LINKEDIN: 'LinkedIn',
  FACEBOOK: 'Facebook',
} as const;

const accountTypeLabels = {
  MEMBER: 'Perfil',
  ORGANIZATION: 'Organizacion',
  PAGE: 'Pagina',
} as const;

const statusLabels = {
  ACTIVE: 'Activa',
  EXPIRED: 'Expirada',
  REVOKED: 'Revocada',
  ERROR: 'Con error',
  DISCONNECTED: 'Desconectada',
} as const;

export default function Channels() {
  const [connections, setConnections] = useState<ApiSocialConnection[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<'linkedin' | 'facebook' | null>(null);
  const [searchParams] = useSearchParams();

  const callbackStatus = searchParams.get('status');
  const callbackProvider = searchParams.get('provider');
  const callbackMessage = searchParams.get('message');

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSocialConnections();
      setConnections(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los canales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  const handleConnect = async (provider: 'linkedin' | 'facebook') => {
    setIsConnecting(provider);
    setError('');

    try {
      const result = await api.startSocialOAuth(provider);
      window.location.assign(result.authUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la conexion');
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await api.disconnectSocialConnection(id);
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desconectar el canal');
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Canales sociales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecta LinkedIn y Facebook para publicar automaticamente desde el scheduler del sistema.
          </p>
        </div>

        {callbackStatus && callbackProvider && (
          <div className={`rounded-xl border p-4 text-sm ${callbackStatus === 'success' ? 'border-border bg-card text-foreground' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
            {platformLabels[callbackProvider.toUpperCase() as keyof typeof platformLabels] || callbackProvider}: {callbackMessage || callbackStatus}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleConnect('linkedin')} disabled={isConnecting !== null}>
            <Share2 className="h-4 w-4 mr-2" />
            {isConnecting === 'linkedin' ? 'Redirigiendo...' : 'Conectar LinkedIn'}
          </Button>
          <Button variant="outline" onClick={() => handleConnect('facebook')} disabled={isConnecting !== null}>
            <Share2 className="h-4 w-4 mr-2" />
            {isConnecting === 'facebook' ? 'Redirigiendo...' : 'Conectar Facebook'}
          </Button>
          <Button variant="ghost" onClick={() => loadConnections()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Conexiones disponibles</h2>
          {connections.length > 0 ? (
            <div className="grid gap-3">
              {connections.map((connection) => (
                <div key={connection.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold text-card-foreground">{connection.accountName}</p>
                    <span className="text-xs text-muted-foreground">{platformLabels[connection.platform]}</span>
                    <span className="text-xs text-muted-foreground">{accountTypeLabels[connection.accountType]}</span>
                    <span className="text-xs text-muted-foreground">{statusLabels[connection.status]}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 px-2 text-xs"
                      onClick={() => handleDisconnect(connection.id)}
                    >
                      <Unplug className="h-3.5 w-3.5 mr-1" />
                      Desconectar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Todavia no hay canales conectados.</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
