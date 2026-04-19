export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const terms = await prisma.glossaryTerm.findMany({
      orderBy: { termDe: 'asc' },
    });
    return NextResponse.json(terms ?? []);
  } catch (error: any) {
    console.error('Glossary fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
