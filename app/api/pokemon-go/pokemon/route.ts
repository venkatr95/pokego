import { NextRequest, NextResponse } from 'next/server';
import { getCollectorIndex, getDefaultEntries, getManifest } from '@/lib/pokemon-go/master';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const defaultsOnly = searchParams.get('defaults') !== '0';
    const speciesId = searchParams.get('speciesId');
    const q = (searchParams.get('q') ?? '').toLowerCase().trim();

    let entries = defaultsOnly ? await getDefaultEntries() : await getCollectorIndex();

    if (speciesId) {
      const id = Number(speciesId);
      entries = entries.filter((e) => e.speciesId === id);
    }

    if (q) {
      entries = entries.filter(
        (e) =>
          e.displayName.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          String(e.speciesId) === q.replace(/^#/, '')
      );
    }

    const manifest = await getManifest();
    return NextResponse.json({ entries, manifest });
  } catch {
    return NextResponse.json(
      { error: 'Pokémon GO data is temporarily unavailable.' },
      { status: 503 }
    );
  }
}
