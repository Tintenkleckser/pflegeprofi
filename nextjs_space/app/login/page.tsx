'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, BookOpenCheck, MessageSquareText, ClipboardCheck } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Ungültige Anmeldedaten'
          : signInError.message);
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError('Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    {
      icon: MessageSquareText,
      title: 'Prufungsgesprache trainieren',
      text: 'Realistische Dialoge fur Pflegeexamen, Patientenkontakt und Fachsprache.',
    },
    {
      icon: ClipboardCheck,
      title: 'Strukturiertes Feedback',
      text: 'Auswertung nach Kommunikation, Fachlichkeit, Dokumentation und Sicherheit.',
    },
    {
      icon: BookOpenCheck,
      title: 'Lernen am Fall',
      text: 'Szenarien werden aus pflegerelevanten Themen und Glossarbegriffen aufgebaut.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>
      <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r bg-muted/30 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <img src="/synthema-logo.png" alt="SYNTHEMA" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-display text-xl font-bold tracking-tight">{t('common.appName')}</p>
              <p className="text-sm text-muted-foreground">{t('common.tagline')}</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-primary">KI-gestutztes Pflege-Training</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Souveran in die Pflegeprufung und in anspruchsvolle Gesprache.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              PflegeProfi verbindet Simulation, Fachsprache und Feedback zu einer ruhigen Lernumgebung fur angehende Pflegefachkrafte.
            </p>
          </div>
          <div className="grid gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-lg border bg-background/80 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <div className="relative mb-2 h-20 w-20">
                <img src="/synthema-logo.png" alt="SYNTHEMA - KI-gestutzte Qualifizierung" className="h-full w-full object-contain" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{t('common.appName')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t('common.tagline')}</p>
            </div>

        <Card className="border-border/80 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{t('common.login')}</CardTitle>
            <CardDescription>Weiterlernen, wo Sie zuletzt aufgehort haben</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e: any) => setEmail(e?.target?.value ?? '')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e: any) => setPassword(e?.target?.value ?? '')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Wird angemeldet...' : t('common.login')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t('common.noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                {t('common.register')}
              </Link>
            </div>
          </CardContent>
        </Card>
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <Link href="/hilfe" className="hover:text-primary hover:underline">Hilfe</Link>
              <Link href="/datenschutz" className="hover:text-primary hover:underline">Datenschutz</Link>
              <Link href="/impressum" className="hover:text-primary hover:underline">Impressum</Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
