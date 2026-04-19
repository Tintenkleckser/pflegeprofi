'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Trophy, Clock, TrendingUp, BookOpenCheck, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimTemplate {
  id: string;
  titleDe: string;
  titleTr: string;
  descriptionDe: string;
  descriptionTr: string;
  difficulty: string;
  maxTurns: number;
}

interface SimHistory {
  id: string;
  templateId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  template: { titleDe: string; titleTr: string };
  evaluation: { scores: any } | null;
  _count: { interactions: number };
}

export function DashboardClient() {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [templates, setTemplates] = useState<SimTemplate[]>([]);
  const [history, setHistory] = useState<SimHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n?.language ?? 'de';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, hRes] = await Promise.all([
          fetch('/api/templates'),
          fetch('/api/simulations'),
        ]);
        const tData = await tRes?.json?.();
        const hData = await hRes?.json?.();
        setTemplates(tData ?? []);
        setHistory(hData ?? []);
      } catch (e: any) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = (history ?? [])?.filter?.((s: SimHistory) => s?.status === 'completed') ?? [];
  const avgScores = completed?.length > 0
    ? completed.reduce((acc: any, s: SimHistory) => {
        const scores = s?.evaluation?.scores ?? {};
        Object.keys(scores ?? {}).forEach((key: string) => {
          acc[key] = (acc[key] ?? 0) + (Number(scores[key]) || 0);
        });
        return acc;
      }, {} as Record<string, number>)
    : {};
  const avgTotal = Object.keys(avgScores ?? {})?.length > 0
    ? Object.values(avgScores ?? {}).reduce((a: any, b: any) => (Number(a) || 0) + (Number(b) || 0), 0) as number / Object.keys(avgScores ?? {}).length / (completed?.length || 1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-1">{t('dashboard.welcome')}</h1>
          <p className="text-muted-foreground mb-8">{t('dashboard.subtitle')}</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.completedCount')}</p>
                    <p className="text-2xl font-bold">{completed?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.avgScore')}</p>
                    <p className="text-2xl font-bold">{avgTotal > 0 ? avgTotal?.toFixed?.(1) ?? '0' : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.inProgress')}</p>
                    <p className="text-2xl font-bold">{(history ?? [])?.filter?.((s: SimHistory) => s?.status === 'in_progress')?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Available Scenarios */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="font-display text-xl font-bold tracking-tight mb-4">{t('dashboard.availableScenarios')}</h2>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {(templates ?? []).map((tmpl: SimTemplate) => (
              <Card key={tmpl?.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpenCheck className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-semibold text-lg">
                          {lang === 'tr' ? tmpl?.titleTr : tmpl?.titleDe}
                        </h3>
                        <Badge variant="secondary" className="text-xs">{tmpl?.difficulty ?? 'intermediate'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lang === 'tr' ? tmpl?.descriptionTr : tmpl?.descriptionDe}
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/simulation/${tmpl?.id}/briefing`)}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Play className="h-4 w-4" />
                      {t('common.startSimulation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Past Simulations */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="font-display text-xl font-bold tracking-tight mb-4">{t('dashboard.pastSimulations')}</h2>
          {(history ?? [])?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>{t('dashboard.noSimulations')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(history ?? []).map((sim: SimHistory) => (
                <Card key={sim?.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                  if (sim?.status === 'completed') {
                    router.push(`/evaluation/${sim?.id}`);
                  } else {
                    router.push(`/simulation/${sim?.templateId}/chat?simId=${sim?.id}`);
                  }
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {lang === 'tr' ? sim?.template?.titleTr : sim?.template?.titleDe}
                          </h3>
                          <Badge variant={sim?.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {sim?.status === 'completed' ? t('dashboard.completed') : t('dashboard.inProgress')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sim?.startedAt ? new Date(sim.startedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'de-DE') : ''}
                          {sim?.evaluation?.scores ? ` \u2022 Ø ${(Object.values(sim.evaluation.scores ?? {}).reduce((a: any, b: any) => (Number(a)||0) + (Number(b)||0), 0) as number / (Object.keys(sim.evaluation.scores ?? {})?.length || 1))?.toFixed?.(1)}/10` : ''}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
