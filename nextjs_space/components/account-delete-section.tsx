'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountDeleteSection() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const deleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || data?.error || 'Konto konnte nicht gelöscht werden.');
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login?accountDeleted=1';
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Konto konnte nicht gelöscht werden.');
      setDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <Trash2 className="h-5 w-5" />
          Konto und Daten löschen
        </CardTitle>
        <CardDescription>
          Löscht Ihr Konto, Profil, Simulationen, Gesprächsverläufe, Dokumentationen und Bewertungen dauerhaft.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Dieser Schritt kann nicht rückgängig gemacht werden. Fallbeispiele in PflegeProfi sind fiktiv und KI-generiert; Ihre eigenen Eingaben und Lernverläufe werden dabei entfernt.
          </p>
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting} className="gap-2">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Konto endgültig löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konto wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Dadurch werden Ihr Supabase-Login und alle zugehörigen PflegeProfi-Daten dauerhaft gelöscht: Profil, Simulationen, Interaktionen, Dokumentationen und Bewertungen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault();
                  deleteAccount();
                }}
              >
                {deleting ? 'Wird gelöscht...' : 'Ja, endgültig löschen'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
