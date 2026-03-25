import { ContentLanguage } from '@/data/mockData';
import { cn } from '@/lib/utils';

const langStyles: Record<ContentLanguage, string> = {
  es: 'bg-lang-es-bg text-lang-es',
  en: 'bg-lang-en-bg text-lang-en',
};

const langLabels: Record<ContentLanguage, string> = {
  es: 'ES',
  en: 'EN',
};

export function LanguageBadge({ language }: { language: ContentLanguage }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', langStyles[language])}>
      {langLabels[language]}
    </span>
  );
}
