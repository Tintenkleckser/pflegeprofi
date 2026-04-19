'use client';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { GlossaryTooltip } from '@/components/glossary-tooltip';
import { Send, User, Stethoscope, Loader2, CheckCircle2, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatClient({ templateId, simId }: { templateId: string; simId: string }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n?.language ?? 'de';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [maxTurns, setMaxTurns] = useState(8);
  const [simStatus, setSimStatus] = useState<'active' | 'evaluating' | 'completed'>('active');
  const [languageMode, setLanguageMode] = useState('bilingual');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Recognition
  const speechLang = lang === 'tr' ? 'tr-TR' : 'de-DE';
  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript: speechTranscript,
    interimTranscript,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    lang: speechLang,
    continuous: true,
    interimResults: true,
    onResult: (finalText: string) => {
      setInput((prev: string) => {
        const combined = prev ? `${prev} ${finalText}` : finalText;
        return combined;
      });
    },
  });

  // Update input with interim transcript for visual feedback
  useEffect(() => {
    if (isListening && speechTranscript) {
      setInput((prev: string) => {
        // Only update if the transcript has new final content
        const base = prev.replace(/\s*$/, '');
        return speechTranscript;
      });
    }
  }, [speechTranscript, isListening]);

  useEffect(() => {
    const fetchSim = async () => {
      try {
        const res = await fetch(`/api/simulations/${simId}`);
        const data = await res?.json?.();
        if (data?.languageMode) setLanguageMode(data.languageMode);
        if (data?.template?.maxTurns) setMaxTurns(data.template.maxTurns);
        const existingMessages: Message[] = (data?.interactions ?? []).flatMap((i: any) => [
          { role: 'user' as const, content: i?.userInput ?? '' },
          { role: 'assistant' as const, content: i?.aiResponse ?? '' },
        ]);
        if (existingMessages?.length > 0) {
          setMessages(existingMessages);
          setTurnCount(data?.interactions?.length ?? 0);
        }
        if (data?.status === 'completed') {
          setSimStatus('completed');
        }
      } catch (e: any) {
        console.error('Fetch sim error:', e);
      }
    };
    if (simId) fetchSim();
  }, [simId]);

  useEffect(() => {
    scrollRef?.current?.scrollTo?.({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input?.trim?.() ?? '';
    if (!trimmed || streaming || simStatus !== 'active') return;
    setInput('');
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages((prev: Message[]) => [...(prev ?? []), userMsg]);
    setStreaming(true);

    const isLastTurn = newTurn >= maxTurns;

    try {
      const res = await fetch('/api/simulation/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simId,
          templateId,
          userMessage: trimmed,
          turnNumber: newTurn,
          languageMode,
          isLastTurn,
          previousMessages: messages ?? [],
        }),
      });

      if (!res?.ok) {
        throw new Error('Stream request failed');
      }

      const reader = res.body?.getReader?.();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let partialRead = '';

      setMessages((prev: Message[]) => [...(prev ?? []), { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split('\n');
        partialRead = lines.pop() ?? '';
        for (const line of lines) {
          if (line?.startsWith?.('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                assistantContent += delta;
                setMessages((prev: Message[]) => {
                  const updated = [...(prev ?? [])];
                  if (updated?.length > 0) {
                    updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  }
                  return updated;
                });
              }
            } catch (e: any) {
              // skip
            }
          }
        }
      }

      // If last turn, trigger evaluation
      if (isLastTurn) {
        setSimStatus('evaluating');
        try {
          const evalRes = await fetch('/api/simulation/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              simId,
              templateId,
              languageMode,
              messages: [...(messages ?? []), userMsg, { role: 'assistant', content: assistantContent }],
            }),
          });
          const evalData = await evalRes?.json?.();
          if (evalData?.evaluationId || evalData?.id) {
            setSimStatus('completed');
          }
        } catch (e: any) {
          console.error('Evaluation error:', e);
          setSimStatus('completed');
        }
      }
    } catch (e: any) {
      console.error('Stream error:', e);
      setMessages((prev: Message[]) => {
        const updated = [...(prev ?? [])];
        if (updated?.length > 0 && updated[updated.length - 1]?.role === 'assistant' && !updated[updated.length - 1]?.content) {
          updated[updated.length - 1] = { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.' };
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault?.();
      sendMessage();
    }
  };

  const remaining = Math.max(0, maxTurns - turnCount);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="mx-auto w-full max-w-[800px] flex flex-col flex-1 px-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Badge variant={remaining > 2 ? 'secondary' : 'destructive'} className="text-xs">
              {t('simulation.turnsRemaining')}: {remaining}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {languageMode === 'bilingual' ? t('simulation.bilingual') : t('simulation.germanOnly')}
            </Badge>
          </div>
          {simStatus === 'active' && turnCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setSimStatus('evaluating');
                try {
                  const evalRes = await fetch('/api/simulation/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ simId, templateId, languageMode, messages }),
                  });
                  await evalRes?.json?.();
                  setSimStatus('completed');
                } catch { setSimStatus('completed'); }
              }}
            >
              {t('simulation.endSimulation')}
            </Button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px] max-h-[calc(100vh-280px)]">
          {(messages ?? [])?.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Beginnen Sie das Gespräch mit dem Patienten...</p>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {(messages ?? []).map((msg: Message, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg?.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg?.role === 'user' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {msg?.role === 'user'
                    ? <User className="h-4 w-4 text-primary" />
                    : <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg?.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  <div className="text-xs font-medium mb-1 opacity-70">
                    {msg?.role === 'user' ? t('simulation.you') : t('simulation.examiner')}
                  </div>
                  <GlossaryTooltip text={msg?.content ?? ''} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {streaming && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('simulation.thinking')}
            </div>
          )}
        </div>

        {/* Evaluation/Completed State */}
        {simStatus === 'evaluating' && (
          <div className="py-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">{t('simulation.evaluating')}</p>
          </div>
        )}
        {simStatus === 'completed' && (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <p className="font-medium mb-3">{t('simulation.simulationComplete')}</p>
            <Button onClick={() => router.push(`/evaluation/${simId}`)} className="gap-2">
              {t('dashboard.viewResults')}
            </Button>
          </div>
        )}

        {/* Input Area */}
        {simStatus === 'active' && (
          <div className="border-t py-4">
            {/* Speech indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {lang === 'tr' ? 'Dinleniyor...' : 'Aufnahme läuft...'}
                </span>
                {interimTranscript && (
                  <span className="text-sm text-muted-foreground italic ml-2 truncate flex-1">
                    {interimTranscript}
                  </span>
                )}
              </motion.div>
            )}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={isListening && interimTranscript ? `${input} ${interimTranscript}`.trim() : input}
                onChange={(e: any) => setInput(e?.target?.value ?? '')}
                onKeyDown={handleKeyDown}
                placeholder={isSpeechSupported
                  ? (lang === 'tr' ? 'Yazın veya mikrofona tıklayın...' : 'Tippen oder Mikrofon klicken...')
                  : t('simulation.typeMessage')
                }
                className="min-h-[48px] max-h-[120px] resize-none"
                rows={1}
                disabled={streaming}
              />
              {isSpeechSupported && (
                <Button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      toggleListening();
                    }
                  }}
                  disabled={streaming}
                  size="icon"
                  variant={isListening ? 'destructive' : 'outline'}
                  className={`h-12 w-12 shrink-0 transition-all ${isListening ? 'animate-pulse' : ''}`}
                  title={isListening
                    ? (lang === 'tr' ? 'Kaydı durdur' : 'Aufnahme stoppen')
                    : (lang === 'tr' ? 'Sesle giriş' : 'Spracheingabe')
                  }
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Button
                onClick={() => {
                  if (isListening) stopListening();
                  sendMessage();
                }}
                disabled={streaming || !(input?.trim?.())}
                size="icon"
                className="h-12 w-12 shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {isSpeechSupported && !isListening && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Mic className="h-3 w-3" />
                {lang === 'tr'
                  ? 'Mikrofon düğmesine tıklayarak sesle yanıt verebilirsiniz'
                  : 'Klicken Sie auf das Mikrofon, um mündlich zu antworten'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
