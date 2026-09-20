import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { DexFilter } from '@pokeyou/pokemon-go-core';
import { formatDexNumber, spriteUrl } from '@pokeyou/pokemon-go-core';
import { useDex } from '../../lib/use-collector';
import { useAppTheme } from '../../lib/theme';
import { Chip, Field, Muted, ProgressBar, Screen, Title } from '../../components/ui';

const FILTERS: { id: DexFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'missing', label: 'Missing' },
  { id: 'caught', label: 'Caught' },
  { id: 'shiny', label: 'Shiny' },
  { id: 'unevolved', label: 'Unevolved' },
];

export default function PokedexScreen() {
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<DexFilter>('all');
  const [query, setQuery] = useState('');
  const { filtered, stats } = useDex(true, filter, query);

  const header = useMemo(
    () => (
      <View style={{ gap: 12, marginBottom: 12 }}>
        <Title>Pokémon GO Pokédex</Title>
        <Muted>
          {stats.caught.toLocaleString()} / {stats.total.toLocaleString()} · {stats.percent}%
        </Muted>
        <ProgressBar value={stats.caught} max={stats.total} />
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, #025, shiny…"
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              label={f.label}
              active={filter === f.id}
              onPress={() => setFilter(f.id)}
            />
          ))}
        </View>
        <Muted>Showing {filtered.length.toLocaleString()}</Muted>
      </View>
    ),
    [filter, filtered.length, query, stats]
  );

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={filtered}
        keyExtractor={(item) => item.entry.key}
        ListHeaderComponent={header}
        initialNumToRender={16}
        windowSize={7}
        renderItem={({ item }) => (
          <Link href={`/pokemon/${encodeURIComponent(item.entry.key)}`} asChild>
            <Pressable
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 12,
                marginBottom: 10,
                borderRadius: 14,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Image
                source={{ uri: spriteUrl(item.entry.speciesId) }}
                style={{ width: 56, height: 56 }}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 12 }}>
                  {formatDexNumber(item.entry.speciesId)}
                </Text>
                <Text style={{ color: colors.foreground, fontWeight: '600' }}>
                  {item.entry.displayName}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {item.status === 'caught'
                    ? 'Caught'
                    : item.status === 'seen'
                      ? 'Seen'
                      : 'Missing'}
                  {item.flags.shiny ? ' · Shiny' : ''}
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </Screen>
  );
}
