'use client';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language ?? 'de';

  const toggleLanguage = () => {
    const newLang = currentLang === 'de' ? 'tr' : 'de';
    i18n?.changeLanguage?.(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      {currentLang === 'de' ? 'TR' : 'DE'}
    </Button>
  );
}
