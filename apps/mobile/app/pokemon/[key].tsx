import { Image, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatDexNumber, parseDexKey, spriteUrl } from '@pokeyou/pokemon-go-core';
import { useDex } from '../../lib/use-collector';
import { useCollectionStore } from '../../store/collection-store';
import { useAppTheme } from '../../lib/theme';
import { Card, Chip, Muted, OutlineButton, Screen, Title } from '../../components/ui';

export default function PokemonDetailScreen() {
  const { colors } = useAppTheme();
  const { key: raw } = useLocalSearchParams<{ key: string }>();
  const key = decodeURIComponent(raw ?? '');
  const { rows } = useDex(false);
  const toggleFlag = useCollectionStore((s) => s.toggleFlag);
  const row = rows.find((r) => r.entry.key === key);
  const parsed = parseDexKey(key);

  if (!row) {
    return (
      <Screen>
        <View style={{ padding: 16 }}>
          <Muted>Pokémon not found.</Muted>
        </View>
      </Screen>
    );
  }

  const { entry, flags, status } = row;
  const toggles = [
    ['caught', 'Caught'],
    ['shiny', 'Shiny'],
    ['shadow', 'Shadow'],
    ['lucky', 'Lucky'],
    ['hundo', 'Hundo'],
  ] as const;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Image
            source={{ uri: spriteUrl(entry.speciesId) }}
            style={{ width: 96, height: 96 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontFamily: 'monospace' }}>
              {formatDexNumber(entry.speciesId)}
            </Text>
            <Title>{entry.displayName}</Title>
            <Muted>
              {entry.types.join(' · ')} · {entry.generation}
            </Muted>
          </View>
        </View>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Your Collection</Text>
          <Muted>
            Status:{' '}
            {status === 'caught' ? 'Caught' : status === 'seen' ? 'Seen' : 'Not seen'}
          </Muted>
          <Muted>
            {[
              flags.shiny && 'Shiny',
              flags.shadow && 'Shadow',
              flags.lucky && 'Lucky',
              flags.hundo && 'Hundo',
            ]
              .filter(Boolean)
              .join(' · ') || 'No special flags yet'}
          </Muted>
          {parsed && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
              {toggles.map(([flag, label]) => (
                <Chip
                  key={flag}
                  label={`Toggle ${label}`}
                  onPress={() => void toggleFlag(parsed.speciesId, parsed.formId, flag)}
                />
              ))}
            </View>
          )}
        </Card>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '700', marginBottom: 8 }}>
            Evolution
          </Text>
          <Muted>
            Family progress {row.evolutionProgress.owned}/{row.evolutionProgress.total}
          </Muted>
        </Card>

        <OutlineButton label="Official connect unavailable" disabled onPress={() => undefined} />
      </ScrollView>
    </Screen>
  );
}
