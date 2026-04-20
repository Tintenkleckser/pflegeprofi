export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ simId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simId } = await params;
    const body = await request.json();
    const { documentation } = body ?? {};

    const sim = await prisma.userSimulation.findFirst({
      where: { id: simId, userId: (session.user as any).id },
    });

    if (!sim) {
      return NextResponse.json({ error: 'Simulation nicht gefunden' }, { status: 404 });
    }

    const updated = await prisma.userSimulation.update({
      where: { id: simId },
      data: { documentation: documentation || '' },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error: any) {
    console.error('Documentation save error:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
