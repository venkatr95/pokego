import { Linking, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { webPath } from '../../lib/config';
import { useQuizStore } from '../../store/quiz-store';
import { useCollectionStore } from '../../store/collection-store';
import { useAppTheme } from '../../lib/theme';
import { Card, Muted, OutlineButton, PrimaryButton, Screen, Title } from '../../components/ui';
import { supabaseConfigured } from '../../lib/supabase';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const card = useQuizStore((s) => s.card);
  const collection = useCollectionStore((s) => s.collection);
  const syncOptIn = useCollectionStore((s) => s.syncOptIn);
  const cloudUserId = useCollectionStore((s) => s.cloudUserId);
  const lastSyncedAt = useCollectionStore((s) => s.lastSyncedAt);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Title>Profile</Title>
        <Muted>Your local trainer progress on this device.</Muted>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Personality card</Text>
          {card ? (
            <>
              <Muted>
                {card.trainerName} · {card.matchedPokemon.displayName} · {card.rarity}
              </Muted>
              <PrimaryButton label="View card" onPress={() => router.push('/result')} />
            </>
          ) : (
            <>
              <Muted>No card yet.</Muted>
              <PrimaryButton label="Take the quiz" onPress={() => router.push('/quiz')} />
            </>
          )}
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>GO collection</Text>
          <Muted>
            {collection
              ? `${collection.pokemon.length} local records`
              : 'No collection imported yet'}
          </Muted>
          <Muted>
            Cloud sync: {syncOptIn ? 'enabled' : 'off'}
            {cloudUserId ? ' · signed in' : ' · signed out'}
          </Muted>
          {lastSyncedAt ? <Muted>Last sync {new Date(lastSyncedAt).toLocaleString()}</Muted> : null}
          <OutlineButton label="Open collection" onPress={() => router.push('/collection')} />
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Achievements</Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }}>
            {card ? '✓ Personality card generated' : '○ Generate a personality card'}
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }}>
            {collection ? '✓ GO collection imported' : '○ Import a GO collection'}
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }}>
            {syncOptIn && cloudUserId ? '✓ Cloud sync connected' : '○ Enable cloud sync'}
          </Text>
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Account & premium</Text>
          <Muted>
            {supabaseConfigured
              ? 'Sign in from Collection for GO cloud sync.'
              : 'Configure Supabase env to enable mobile sign-in.'}
          </Muted>
          <OutlineButton
            label="Premium / Stripe on website"
            onPress={() => void Linking.openURL(webPath('/premium'))}
          />
          <OutlineButton
            label="Leaderboard (web)"
            onPress={() => void Linking.openURL(webPath('/leaderboard'))}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
