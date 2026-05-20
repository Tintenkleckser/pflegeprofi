import { NextRequest, NextResponse } from 'next/server';

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Zu viele Anfragen. Bitte versuchen Sie es gleich erneut.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    },
  );
}

export function textLength(value: unknown) {
  return typeof value === 'string' ? value.trim().length : 0;
}

export function compactMessages(
  messages: unknown,
  {
    maxMessages,
    maxContentLength,
  }: {
    maxMessages: number;
    maxContentLength: number;
  },
) {
  if (!Array.isArray(messages)) return [];

  return messages.slice(-maxMessages).map((message: any) => ({
    role: message?.role === 'user' ? 'user' : 'assistant',
    content: String(message?.content ?? '').slice(0, maxContentLength),
  }));
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
