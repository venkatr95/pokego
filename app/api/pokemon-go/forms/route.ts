import { NextRequest, NextResponse } from 'next/server';
import { getCollectorIndex } from '@/lib/pokemon-go/master';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const speciesId = searchParams.get('speciesId');
    const costumes = searchParams.get('costumes') === '1';
    const regionals = searchParams.get('regionals') === '1';

    let entries = await getCollectorIndex();
    entries = entries.filter((e) => !e.isDefault || e.isCostume || e.isRegional);

    if (speciesId) {
      const id = Number(speciesId);
      entries = (await getCollectorIndex()).filter((e) => e.speciesId === id);
    }
    if (costumes) entries = entries.filter((e) => e.isCostume);
    if (regionals) entries = entries.filter((e) => e.isRegional);

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json(
      { error: 'Pokémon GO data is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
