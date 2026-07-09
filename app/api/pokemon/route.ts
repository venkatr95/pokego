import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { searchPokemon } from '@/lib/pokemon';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  const results = await searchPokemon(query, Math.min(limit, 50));
  return NextResponse.json(results);
}
