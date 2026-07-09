import { NextResponse } from 'next/server';
import { cache } from '@/app/api/generate-card/route';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cached = cache.get(id);
  if (cached) {
    return NextResponse.json({ card: cached.card });
  }

  return NextResponse.json({ error: 'Card not found' }, { status: 404 });
}
