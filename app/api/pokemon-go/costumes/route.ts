import { NextResponse } from 'next/server';
import { getCostumes } from '@/lib/pokemon-go/master';

export async function GET() {
  try {
    const costumes = await getCostumes();
    return NextResponse.json({ costumes });
  } catch {
    return NextResponse.json(
      { error: 'Pokémon GO data is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
