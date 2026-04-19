export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { simId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const simulation = await prisma.userSimulation.findFirst({
      where: { id: params?.simId ?? '', userId },
      include: {
        template: true,
        interactions: { orderBy: { turnNumber: 'asc' } },
        evaluation: true,
      },
    });
    if (!simulation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(simulation);
  } catch (error: any) {
    console.error('Fetch simulation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
