'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'pflegeprofi-cookie-notice-accepted';

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-lg border bg-background p-3 shadow-lg sm:bottom-5 sm:p-4">
      <div className="flex gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Datenschutz und notwendige Cookies</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                PflegeProfi nutzt notwendige Cookies und lokalen Speicher fur Anmeldung, Sprache, Darstellung und diesen Hinweis. Es werden keine Marketing-Cookies gesetzt.
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={accept} aria-label="Hinweis schliessen">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={accept}>
              Verstanden
            </Button>
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/datenschutz">Datenschutz ansehen</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/hilfe">Hilfe</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
