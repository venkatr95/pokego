import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportCollectionCsv, exportCollectionJson } from '@pokeyou/pokemon-go-core';
import { AUTH_REDIRECT, supabase, supabaseConfigured } from '../../lib/supabase';
import { useCollectionStore } from '../../store/collection-store';
import { useAppTheme } from '../../lib/theme';
import {
  Card,
  Field,
  Muted,
  OutlineButton,
  PrimaryButton,
  Screen,
  Title,
} from '../../components/ui';

export default function CollectionScreen() {
  const { colors } = useAppTheme();
  const collection = useCollectionStore((s) => s.collection);
  const importText = useCollectionStore((s) => s.importText);
  const clear = useCollectionStore((s) => s.clear);
  const syncOptIn = useCollectionStore((s) => s.syncOptIn);
  const syncState = useCollectionStore((s) => s.syncState);
  const syncError = useCollectionStore((s) => s.syncError);
  const lastSyncedAt = useCollectionStore((s) => s.lastSyncedAt);
  const cloudUserId = useCollectionStore((s) => s.cloudUserId);
  const enableSync = useCollectionStore((s) => s.enableSync);
  const disableSync = useCollectionStore((s) => s.disableSync);
  const syncNow = useCollectionStore((s) => s.syncNow);

  const [email, setEmail] = useState('');
  const [companion, setCompanion] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickFile() {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/csv', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    setBusy(true);
    try {
      const text = await FileSystem.readAsStringAsync(asset.uri);
      const kind = asset.name?.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
      await importText(text, kind);
      setMessage(`Imported ${asset.name ?? 'file'}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  async function exportFile(kind: 'json' | 'csv') {
    if (!collection) return;
    const content =
      kind === 'json' ? exportCollectionJson(collection) : exportCollectionCsv(collection);
    const file = `${FileSystem.cacheDirectory}pokeyou-go-collection.${kind}`;
    await FileSystem.writeAsStringAsync(file, content);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file);
    } else {
      Alert.alert('Exported', `Saved to ${file}`);
    }
  }

  async function sendMagicLink() {
    if (!supabase) {
      setMessage('Supabase env not configured.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: AUTH_REDIRECT },
    });
    setBusy(false);
    setMessage(error ? error.message : 'Check your email for the magic link.');
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage('Signed out');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Title>Collection</Title>
        <Muted>
          Your collection stays on this device. Cloud sync is optional and never asks for a
          Pokémon GO password. Trainer ID is not authentication.
        </Muted>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Import</Text>
          <PrimaryButton
            label={busy ? 'Working…' : 'Pick JSON / CSV file'}
            onPress={() => void pickFile()}
            disabled={busy}
          />
          <Field
            value={companion}
            onChangeText={setCompanion}
            placeholder="Paste companion JSON…"
            multiline
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />
          <OutlineButton
            label="Import pasted JSON"
            disabled={busy || !companion.trim()}
            onPress={() => {
              setBusy(true);
              void importText(companion, 'json')
                .then(() => {
                  setCompanion('');
                  setMessage('Companion JSON imported');
                })
                .catch((e) => setMessage(e instanceof Error ? e.message : 'Import failed'))
                .finally(() => setBusy(false));
            }}
          />
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Export / clear</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <OutlineButton
                label="Export JSON"
                disabled={!collection}
                onPress={() => void exportFile('json')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <OutlineButton
                label="Export CSV"
                disabled={!collection}
                onPress={() => void exportFile('csv')}
              />
            </View>
          </View>
          <OutlineButton
            label="Clear local collection"
            disabled={!collection}
            onPress={() => void clear()}
          />
          {collection && (
            <Muted>
              {collection.pokemon.length} records
              {collection.trainer?.nickname ? ` · ${collection.trainer.nickname}` : ''}
            </Muted>
          )}
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Cloud sync</Text>
          {!supabaseConfigured ? (
            <Muted>
              Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to apps/mobile/.env
            </Muted>
          ) : (
            <>
              {cloudUserId ? (
                <>
                  <Muted>Signed in</Muted>
                  <OutlineButton label="Sign out" onPress={() => void signOut()} />
                </>
              ) : (
                <>
                  <Field
                    value={email}
                    onChangeText={setEmail}
                    placeholder="trainer@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <PrimaryButton
                    label={busy ? 'Sending…' : 'Send magic link'}
                    disabled={busy || !email.trim()}
                    onPress={() => void sendMagicLink()}
                  />
                </>
              )}
              {!syncOptIn ? (
                <PrimaryButton
                  label="Enable cloud sync"
                  disabled={!cloudUserId || !collection}
                  onPress={() => void enableSync()}
                />
              ) : (
                <View style={{ gap: 8 }}>
                  <PrimaryButton
                    label={syncState === 'syncing' ? 'Syncing…' : 'Sync now'}
                    disabled={!cloudUserId || syncState === 'syncing'}
                    onPress={() => void syncNow()}
                  />
                  <OutlineButton label="Pause sync" onPress={() => void disableSync()} />
                </View>
              )}
              <Muted>
                Status: {syncState}
                {lastSyncedAt ? ` · Last: ${new Date(lastSyncedAt).toLocaleString()}` : ''}
              </Muted>
              {syncError ? (
                <Text style={{ color: colors.danger, fontSize: 13 }}>{syncError}</Text>
              ) : null}
            </>
          )}
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Official Pokémon GO</Text>
          <Muted>
            Not available yet. PokéYou will only use a supported official API when one exists —
            never your Pokémon GO password.
          </Muted>
          <OutlineButton label="Connect (unavailable)" disabled onPress={() => undefined} />
        </Card>

        {message ? <Muted>{message}</Muted> : null}
      </ScrollView>
    </Screen>
  );
}
