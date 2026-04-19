export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([], { status: 401 });
    const userId = (session.user as any)?.id;
    if (!userId) return NextResponse.json([], { status: 401 });
    const simulations = await prisma.userSimulation.findMany({
      where: { userId },
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
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const body = await request.json();
    const { templateId, languageMode } = body ?? {};
    if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    const simulation = await prisma.userSimulation.create({
      data: {
        userId,
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
