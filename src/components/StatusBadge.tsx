import { ContentStatus, statusLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusStyles: Record<ContentStatus, string> = {
  idea: 'bg-status-idea-bg text-status-idea',
  borrador: 'bg-muted text-muted-foreground',
  listo: 'bg-status-ready-bg text-status-ready',
  publicado: 'bg-status-published-bg text-status-published',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {statusLabels[status]}
    </span>
  );
}
