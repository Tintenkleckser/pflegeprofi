'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISSED_KEY = 'pflegeprofi-pwa-install-dismissed';

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export function PwaInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandaloneDisplay()) return;
    if (window.localStorage.getItem(DISMISSED_KEY) === 'true') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isiOSDevice);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = window.setTimeout(() => {
      if (isiOSDevice && !isStandaloneDisplay()) setVisible(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const message = useMemo(() => {
    if (isIos) {
      return 'Auf iPhone/iPad ueber Teilen und "Zum Home-Bildschirm" installieren.';
    }
    return 'PflegeProfi kann als App auf diesem Geraet installiert werden.';
  }, [isIos]);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-lg border bg-background p-3 shadow-lg sm:bottom-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
          {isIos ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">PflegeProfi als App nutzen</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{message}</p>
          {!isIos && installPrompt && (
            <Button size="sm" className="mt-3 h-9" onClick={install}>
              Installieren
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={dismiss} aria-label="Hinweis schliessen">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
