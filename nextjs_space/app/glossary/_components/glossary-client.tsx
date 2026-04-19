'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/app-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Search, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlossaryItem {
  id: string;
  termDe: string;
  termTr: string;
  contextDe: string;
  contextTr: string;
}

export function GlossaryClient() {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language ?? 'de';
  const [terms, setTerms] = useState<GlossaryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch('/api/glossary');
        const data = await res?.json?.();
        setTerms(data ?? []);
      } catch (e: any) {
        console.error('Glossary fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  const filtered = (terms ?? []).filter((term: GlossaryItem) => {
    const q = (search ?? '').toLowerCase();
    return (
      (term?.termDe ?? '').toLowerCase().includes(q) ||
      (term?.termTr ?? '').toLowerCase().includes(q) ||
      (term?.contextDe ?? '').toLowerCase().includes(q) ||
      (term?.contextTr ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[800px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">{t('glossary.title')}</h1>
          </div>
          <p className="text-muted-foreground mb-6">{t('glossary.subtitle')}</p>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('glossary.searchPlaceholder')}
              value={search}
              onChange={(e: any) => setSearch(e?.target?.value ?? '')}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">{t('common.loading')}</div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('glossary.noResults')}</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((term: GlossaryItem, idx: number) => (
                <motion.div
                  key={term?.id ?? idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display font-semibold text-primary">{term?.termDe ?? ''}</span>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <span className="font-display font-semibold text-orange-600">{term?.termTr ?? ''}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">DE</p>
                          <p className="text-foreground/80">{term?.contextDe ?? ''}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2">
                          <p className="text-xs font-medium text-orange-600 mb-1">TR</p>
                          <p className="text-foreground/80">{term?.contextTr ?? ''}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
