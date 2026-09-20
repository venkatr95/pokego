// ============================================================
// CollectionProvider — import, companion, official (gated)
// ============================================================

import type {
  CollectionProvider,
  PokemonGoCollection,
  PokemonGoTrainer,
} from '@/types/pokemon-go';
import { parseCollectionCsv, parseCollectionJson } from './import-export';

export class ImportFileProvider implements CollectionProvider {
  private collection: PokemonGoCollection | null = null;
  private trainer: PokemonGoTrainer | null = null;

  constructor(private readonly fileText: string, private readonly kind: 'json' | 'csv') {}

  async connect(): Promise<void> {
    this.collection =
      this.kind === 'json'
        ? parseCollectionJson(this.fileText)
        : parseCollectionCsv(this.fileText);
    this.trainer = this.collection.trainer ?? null;
  }

  async getTrainer(): Promise<PokemonGoTrainer | null> {
    if (!this.collection) await this.connect();
    return this.trainer;
  }

  async getCollection(): Promise<PokemonGoCollection> {
    if (!this.collection) await this.connect();
    return this.collection!;
  }
}

/** Companion app / exporter — legitimate user-owned JSON only. */
export class CompanionProvider implements CollectionProvider {
  private collection: PokemonGoCollection | null = null;
  private trainer: PokemonGoTrainer | null = null;

  constructor(private readonly jsonText: string) {}

  async connect(): Promise<void> {
    this.collection = parseCollectionJson(this.jsonText);
    this.collection = {
      ...this.collection,
      updatedAt: new Date().toISOString(),
    };
    this.trainer = this.collection.trainer ?? null;
  }

  async getTrainer(): Promise<PokemonGoTrainer | null> {
    if (!this.collection) await this.connect();
    return this.trainer;
  }

  async getCollection(): Promise<PokemonGoCollection> {
    if (!this.collection) await this.connect();
    return this.collection!;
  }
}

/**
 * Official provider — only active when a supported API base URL is configured.
 * Never asks for Pokémon GO passwords. Trainer ID is not authentication.
 */
export class OfficialProvider implements CollectionProvider {
  private collection: PokemonGoCollection | null = null;
  private trainer: PokemonGoTrainer | null = null;

  static isConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_POGO_OFFICIAL_API_URL;
  }

  async connect(): Promise<void> {
    const base = process.env.NEXT_PUBLIC_POGO_OFFICIAL_API_URL;
    if (!base) {
      throw new Error(
        'Official Pokémon GO connection is not available yet. PokéYou only supports a legitimate authorized API when one exists — we never ask for your Pokémon GO password.'
      );
    }

    // Placeholder contract for a future supported API:
    // GET {base}/collection  Authorization: Bearer <PokéYou-managed OAuth token>
    const res = await fetch(`${base.replace(/\/$/, '')}/collection`, {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Official connection failed (${res.status}). Try again later or import a file.`);
    }
    const data = (await res.json()) as PokemonGoCollection;
    this.collection = {
      ...data,
      importedAt: data.importedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.trainer = this.collection.trainer ?? null;
  }

  async getTrainer(): Promise<PokemonGoTrainer | null> {
    if (!this.collection) await this.connect();
    return this.trainer;
  }

  async getCollection(): Promise<PokemonGoCollection> {
    if (!this.collection) await this.connect();
    return this.collection!;
  }
}

/** @deprecated use OfficialProvider */
export class StubOfficialProvider extends OfficialProvider {}

export async function importFromFile(file: File): Promise<PokemonGoCollection> {
  const text = await file.text();
  const name = file.name.toLowerCase();
  const kind: 'json' | 'csv' = name.endsWith('.csv') ? 'csv' : 'json';
  const provider = new ImportFileProvider(text, kind);
  await provider.connect();
  return provider.getCollection();
}

export async function importFromCompanionJson(text: string): Promise<PokemonGoCollection> {
  const provider = new CompanionProvider(text);
  await provider.connect();
  return provider.getCollection();
}

export const COMPANION_PAYLOAD_KEY = 'pokeyou-go-companion-payload';
