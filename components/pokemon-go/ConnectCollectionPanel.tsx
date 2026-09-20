'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OfficialProvider, COMPANION_PAYLOAD_KEY } from '@/lib/pokemon-go/provider';
import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';

export function ConnectCollectionPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const companionFileRef = useRef<HTMLInputElement>(null);
  const [companionText, setCompanionText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notifyOfficial, setNotifyOfficial] = useState(false);

  const importFile = usePokemonGoCollectionStore((s) => s.importFile);
  const importCompanionJson = usePokemonGoCollectionStore((s) => s.importCompanionJson);
  const connectOfficial = usePokemonGoCollectionStore((s) => s.connectOfficial);
  const error = usePokemonGoCollectionStore((s) => s.error);
  const searchParams = useSearchParams();

  const officialReady = OfficialProvider.isConfigured();

  useEffect(() => {
    const wantCompanion = searchParams.get('companion') === '1';
    if (!wantCompanion) return;
    try {
      const payload = sessionStorage.getItem(COMPANION_PAYLOAD_KEY);
      if (payload) {
        sessionStorage.removeItem(COMPANION_PAYLOAD_KEY);
        setBusy(true);
        void importCompanionJson(payload)
          .then(() => setMessage('Companion collection imported.'))
          .catch((e) => setMessage(e instanceof Error ? e.message : 'Companion import failed.'))
          .finally(() => setBusy(false));
      }
    } catch {
      // ignore
    }
  }, [searchParams, importCompanionJson]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; payload?: string } | null;
      if (data?.type !== 'pokeyou-go-companion' || typeof data.payload !== 'string') return;
      setBusy(true);
      void importCompanionJson(data.payload)
        .then(() => setMessage('Companion collection imported via postMessage.'))
        .catch((e) => setMessage(e instanceof Error ? e.message : 'Companion import failed.'))
        .finally(() => setBusy(false));
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [importCompanionJson]);

  async function onImportFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      await importFile(file);
      setMessage(`Imported ${file.name} successfully.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onCompanionFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      await importCompanionJson(text);
      setMessage('Companion file imported.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Companion import failed.');
    } finally {
      setBusy(false);
      if (companionFileRef.current) companionFileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Connect collection</h2>
      <p className="text-sm text-foreground/60">
        Choose how to load your collection. A Trainer ID is never treated as authentication.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Import file */}
        <div className="glass-card rounded-xl p-4 space-y-3 flex flex-col">
          <h3 className="font-medium text-sm">Import file</h3>
          <p className="text-xs text-foreground/55 flex-1">
            Upload a JSON or CSV export from this device.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            className="hidden"
            onChange={(e) => void onImportFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="btn-primary text-sm py-2 px-3 disabled:opacity-50"
          >
            Choose file
          </button>
        </div>

        {/* Companion */}
        <div className="glass-card rounded-xl p-4 space-y-3 flex flex-col">
          <h3 className="font-medium text-sm">Companion</h3>
          <p className="text-xs text-foreground/55">
            Paste or upload JSON from a legitimate companion exporter of{' '}
            <em>your</em> data. See companion docs for the schema.
          </p>
          <textarea
            value={companionText}
            onChange={(e) => setCompanionText(e.target.value)}
            placeholder='{"importedAt":"...","pokemon":[...]}'
            rows={3}
            className="w-full glass rounded-lg px-2 py-1.5 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <input
            ref={companionFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => void onCompanionFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2 mt-auto">
            <button
              type="button"
              disabled={busy || !companionText.trim()}
              onClick={() => {
                setBusy(true);
                setMessage(null);
                void importCompanionJson(companionText)
                  .then(() => {
                    setMessage('Companion JSON imported.');
                    setCompanionText('');
                  })
                  .catch((e) =>
                    setMessage(e instanceof Error ? e.message : 'Companion import failed.')
                  )
                  .finally(() => setBusy(false));
              }}
              className="btn-primary text-sm py-2 px-3 disabled:opacity-50"
            >
              Paste import
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => companionFileRef.current?.click()}
              className="glass rounded-lg text-sm py-2 px-3"
            >
              Upload JSON
            </button>
          </div>
        </div>

        {/* Official stub */}
        <div className="glass-card rounded-xl p-4 space-y-3 flex flex-col">
          <h3 className="font-medium text-sm">Official Pokémon GO</h3>
          <p className="text-xs text-foreground/55 flex-1">
            {officialReady
              ? 'A supported official API endpoint is configured.'
              : 'Not available yet. PokéYou will only use a supported Niantic/authorization API when one exists. We never ask for your Pokémon GO password. Trainer ID is not login.'}
          </p>
          <button
            type="button"
            disabled={busy || !officialReady}
            onClick={() => {
              setBusy(true);
              setMessage(null);
              void connectOfficial()
                .then(() => setMessage('Official collection connected.'))
                .catch((e) =>
                  setMessage(e instanceof Error ? e.message : 'Official connection failed.')
                )
                .finally(() => setBusy(false));
            }}
            className="btn-primary text-sm py-2 px-3 disabled:opacity-40"
          >
            Connect
          </button>
          {!officialReady && (
            <label className="flex items-center gap-2 text-xs text-foreground/60">
              <input
                type="checkbox"
                checked={notifyOfficial}
                onChange={(e) => {
                  setNotifyOfficial(e.target.checked);
                  try {
                    localStorage.setItem(
                      'pokeyou-go-official-notify',
                      e.target.checked ? '1' : '0'
                    );
                  } catch {
                    // ignore
                  }
                }}
              />
              Remind me on this device when official connect ships
            </label>
          )}
        </div>
      </div>

      {(message || error) && (
        <p className="text-sm text-foreground/70" role="status">
          {message ?? error}
        </p>
      )}
    </div>
  );
}
