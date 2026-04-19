'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, RotateCcw, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface EvalData {
  id: string;
  status: string;
  template: { titleDe: string; titleTr: string };
  evaluation: {
    feedbackDe: string;
    feedbackTr: string;
    scores: Record<string, number>;
  } | null;
  interactions: Array<{ userInput: string; aiResponse: string; turnNumber: number }>;
}

export function EvaluationClient({ simId }: { simId: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n?.language ?? 'de';
  const [data, setData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/simulations/${simId}`);
        const d = await res?.json?.();
        setData(d ?? null);
      } catch (e: any) {
        console.error('Evaluation fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    if (simId) fetchData();
  }, [simId]);

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

  const scores = data?.evaluation?.scores ?? {};
  const scoreKeys = Object.keys(scores ?? {});
  const avgScore = scoreKeys?.length > 0
    ? (Object.values(scores ?? {}).reduce((a: any, b: any) => (Number(a)||0) + (Number(b)||0), 0) as number) / scoreKeys.length
    : 0;

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const scoreLabels: Record<string, { de: string; tr: string }> = {
    fachsprache: { de: 'Fachsprache', tr: 'Tıbbi Terminoloji' },
    struktur: { de: 'Struktur', tr: 'Yapı' },
    empathie: { de: 'Empathie', tr: 'Empati' },
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[800px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('evaluation.backToDashboard')}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">{t('evaluation.title')}</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            {lang === 'tr' ? data?.template?.titleTr : data?.template?.titleDe}
          </p>

          {/* Overall Score */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                    {avgScore?.toFixed?.(1) ?? '0'}
                  </span>
                </div>
                <div>
                  <p className="font-display font-semibold text-lg">{t('evaluation.overall')}</p>
                  <p className="text-sm text-muted-foreground">{t('evaluation.outOf')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Scores */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                {t('evaluation.scores')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {scoreKeys.map((key: string) => {
                const score = Number(scores[key]) || 0;
                const label = scoreLabels[key] ?? { de: key, tr: key };
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{lang === 'tr' ? label.tr : label.de}</span>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}/10</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 10}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className={`h-full rounded-full ${getProgressColor(score)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t('evaluation.feedback')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="de">
                <TabsList className="mb-4">
                  <TabsTrigger value="de">Deutsch</TabsTrigger>
                  <TabsTrigger value="tr">Türkçe</TabsTrigger>
                </TabsList>
                <TabsContent value="de">
                  <p className="text-sm leading-relaxed">{data?.evaluation?.feedbackDe ?? 'Kein Feedback verfügbar.'}</p>
                </TabsContent>
                <TabsContent value="tr">
                  <p className="text-sm leading-relaxed">{data?.evaluation?.feedbackTr ?? 'Geri bildirim mevcut değil.'}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Conversation Review */}
          {(data?.interactions ?? [])?.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Gesprächsverlauf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {(data?.interactions ?? []).map((interaction: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs font-medium text-primary mb-1">{t('simulation.you')}</p>
                        <p className="text-sm">{interaction?.userInput ?? ''}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t('simulation.examiner')}</p>
                        <p className="text-sm">{interaction?.aiResponse ?? ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              {t('evaluation.backToDashboard')}
            </Button>
            <Button className="flex-1 gap-2" onClick={() => {
              const tid = (data as any)?.templateId ?? (data as any)?.template_id;
              if (tid) router.push(`/simulation/${tid}/briefing`);
              else router.push('/dashboard');
            }}>
              <RotateCcw className="h-4 w-4" />
              {t('evaluation.newSimulation')}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
