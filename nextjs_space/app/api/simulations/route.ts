export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth-helpers';
import { prisma } from '@/lib/db';
import { getClientIp, rateLimit, rateLimitResponse } from '@/lib/api-protection';
import { isNursingScopeTemplate } from '@/lib/nursing-scope';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json([], { status: 401 });
    const simulations = await prisma.userSimulation.findMany({
      where: { userId: user.id },
      include: {
        template: { select: { titleDe: true, titleTr: true } },
        evaluation: { select: { scores: true } },
        _count: { select: { interactions: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
    return NextResponse.json(simulations ?? []);
  } catch (error: any) {
    console.error('Simulations fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limit = rateLimit({
      key: `create-simulation:${user.id}:${getClientIp(request)}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetAt);
    }

    const body = await request.json();
    const { templateId, languageMode } = body ?? {};
    if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });

    const template = await prisma.simulationTemplate.findUnique({
      where: { id: templateId },
      select: {
        titleDe: true,
        titleTr: true,
        descriptionDe: true,
        descriptionTr: true,
        systemPrompt: true,
      },
    });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (!isNursingScopeTemplate(template)) {
      console.error('Blocked out-of-scope simulation template:', templateId);
      return NextResponse.json(
        { error: 'Diese Simulation liegt nicht im Pflegebereich und wurde gesperrt.' },
        { status: 422 },
      );
    }

    const simulation = await prisma.userSimulation.create({
      data: {
        userId: user.id,
        templateId,
        languageMode: languageMode ?? 'bilingual',
        status: 'in_progress',
      },
    });
    return NextResponse.json(simulation);
  } catch (error: any) {
    console.error('Create simulation error:', error);
    return NextResponse.json({ error: 'Failed to create simulation' }, { status: 500 });
  }
}
