'use client';

import { useI18n, type Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'transparent';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className={cn(
        'h-9 w-9',
        variant === 'transparent' && 'text-white hover:text-white hover:bg-white/10'
      )}
    >
      <Globe className="h-4 w-4" />
    </Button>
  );
}

export function LanguageSwitcherSelect() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="bg-transparent border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}
