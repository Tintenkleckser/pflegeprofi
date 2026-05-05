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
import { Mail, Lock, AlertCircle, GraduationCap, Languages, LineChart } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        router.replace('/dashboard');
        router.refresh();
        return;
      }
      setSuccess('Registrierung erfolgreich. Bitte bestätigen Sie ggf. Ihre E-Mail-Adresse und melden Sie sich danach an.');
    } catch (err: any) {
      setError('Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: GraduationCap, label: 'Examenstraining mit realistischen Pflegefallen' },
    { icon: Languages, label: 'Deutsch und Turkisch fur den Lernalltag' },
    { icon: LineChart, label: 'Feedback und Fortschritt nach jeder Simulation' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>
      <main className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
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
            <CardTitle>{t('common.register')}</CardTitle>
            <CardDescription>Kostenlos starten und eigene Simulationen anlegen</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  {success}
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
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e: any) => setPassword(e?.target?.value ?? '')}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e?.target?.value ?? '')}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Wird registriert...' : t('common.register')}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t('common.hasAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('common.login')}
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

        <section className="hidden border-l bg-muted/30 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <img src="/synthema-logo.png" alt="SYNTHEMA" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-display text-xl font-bold tracking-tight">{t('common.appName')}</p>
              <p className="text-sm text-muted-foreground">{t('common.tagline')}</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-primary">Pflegewissen praktisch uben</p>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Eine Lernumgebung fur Fachsprache, Handlungssicherheit und Feedback.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Erstellen Sie Szenarien, trainieren Sie Gesprache und nutzen Sie Auswertungen, um gezielt besser zu werden.
            </p>
          </div>
          <div className="grid gap-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-background/80 p-4 text-sm font-medium">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
