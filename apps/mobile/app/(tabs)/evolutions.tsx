import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getIncompleteFamilies,
  getMissingEdges,
  getReadyEdges,
  type EvolutionEdge,
  type EvolutionFamily,
} from '@pokeyou/pokemon-go-core';
import { useFamilies } from '../../lib/use-collector';
import { useAppTheme } from '../../lib/theme';
import { Card, Chip, Muted, ProgressBar, Screen, Title } from '../../components/ui';

type ViewId = 'unevolved' | 'ready' | 'missing';
type Row =
  | { key: string; kind: 'edge'; e: EvolutionEdge }
  | { key: string; kind: 'family'; f: EvolutionFamily };

export default function EvolutionsScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ view?: string }>();
  const initial =
    params.view === 'ready' || params.view === 'missing' || params.view === 'unevolved'
      ? params.view
      : 'unevolved';
  const [view, setView] = useState<ViewId>(initial);
  const { families } = useFamilies();

  const incomplete = useMemo(() => getIncompleteFamilies(families), [families]);
  const ready = useMemo(() => getReadyEdges(families), [families]);
  const missing = useMemo(() => getMissingEdges(families), [families]);

  const data: Row[] = useMemo(() => {
    if (view === 'ready') {
      return ready.map((e) => ({ key: `${e.fromKey}-${e.toKey}`, kind: 'edge' as const, e }));
    }
    if (view === 'missing') {
      return missing
        .slice(0, 200)
        .map((e) => ({ key: `${e.fromKey}-${e.toKey}`, kind: 'edge' as const, e }));
    }
    return incomplete.map((f) => ({
      key: String(f.familyId),
      kind: 'family' as const,
      f,
    }));
  }, [view, ready, missing, incomplete]);

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 8 }}>
            <Title>Evolutions</Title>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {(
                [
                  ['unevolved', 'Unevolved'],
                  ['ready', 'Ready'],
                  ['missing', 'Missing'],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} label={label} active={view === id} onPress={() => setView(id)} />
              ))}
            </View>
          </View>
        }
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.kind === 'family') {
            return (
              <Card>
                <Text style={{ color: colors.foreground, fontWeight: '700' }}>{item.f.name}</Text>
                <View style={{ marginVertical: 8 }}>
                  <ProgressBar value={item.f.ownedCount} max={item.f.totalCount} />
                </View>
                {item.f.members.map((m) => (
                  <Text key={m.entry.key} style={{ color: colors.muted, marginTop: 2 }}>
                    {m.owned ? '✓' : '✗'} {m.entry.name}
                  </Text>
                ))}
              </Card>
            );
          }
          return (
            <Card>
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>
                {item.e.fromName} → {item.e.toName}
              </Text>
              <Muted>{item.e.requirementLabel}</Muted>
            </Card>
          );
        }}
        ListEmptyComponent={<Muted>Nothing in this view yet.</Muted>}
      />
    </Screen>
  );
}
