import { AlertTriangle } from 'lucide-react';

export function AiDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">KI-gestütztes Lernwerkzeug</p>
          <p className="text-sm leading-6">
            Simulationen, fiktive Patientensituationen, Antworten und Bewertungen werden mit KI-Unterstützung erzeugt. Die Inhalte dienen der Prüfungsvorbereitung und ersetzen keine medizinische Beratung, keine verbindliche Prüfungsentscheidung und keine fachliche Supervision.
          </p>
        </div>
      </div>
    </div>
  );
}
