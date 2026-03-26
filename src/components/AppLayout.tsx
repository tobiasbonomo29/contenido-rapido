import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Palette, BookOpen, Plus, LogOut, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Contenido', icon: Database, path: '/contenido' },
  { label: 'Canales', icon: Share2, path: '/canales' },
  { label: 'Plantillas', icon: Palette, path: '/plantillas' },
  { label: 'Fuentes', icon: BookOpen, path: '/fuentes' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card p-4 shrink-0">
        <div className="mb-8">
          <h1 className="font-display text-lg font-bold text-foreground">ContentOS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tu sistema de contenido</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname.startsWith(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            className="w-full justify-start"
            size="sm"
            onClick={() => navigate('/contenido/nuevo')}
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo contenido
          </Button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around py-2 px-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors',
              location.pathname.startsWith(item.path)
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
        <button
          onClick={() => navigate('/contenido/nuevo')}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs text-primary"
        >
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Plus className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          Nuevo
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
