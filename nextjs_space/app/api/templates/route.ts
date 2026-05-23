export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isNursingScopeTemplate } from '@/lib/nursing-scope';

export async function GET() {
  try {
    const templates = await prisma.simulationTemplate.findMany();
    return NextResponse.json((templates ?? []).filter(isNursingScopeTemplate));
  } catch (error: any) {
    console.error('Templates fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
