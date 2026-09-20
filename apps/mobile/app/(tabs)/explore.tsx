import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { formatDexNumber } from '@pokeyou/pokemon-go-core';
import { useDex } from '../../lib/use-collector';
import { useAppTheme } from '../../lib/theme';
import { Chip, Muted, OutlineButton, Screen, Title } from '../../components/ui';

type Tab = 'forms' | 'missing';

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'forms' ? 'forms' : 'missing');
  const { rows } = useDex(false);

  const forms = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!r.entry.isDefault || r.entry.isCostume || r.entry.isRegional) &&
          r.status !== 'caught'
      ),
    [rows]
  );
  const missing = useMemo(
    () =>
      rows.filter(
        (r) => r.entry.isDefault && !r.entry.isCostume && r.status === 'not_seen'
      ),
    [rows]
  );
  const data = tab === 'forms' ? forms : missing;

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 8 }}>
            <Title>Explore</Title>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <OutlineButton label="Goals" onPress={() => router.push('/goals')} />
              </View>
              <View style={{ flex: 1 }}>
                <OutlineButton label="Evolutions" onPress={() => router.push('/evolutions')} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip label="Missing" active={tab === 'missing'} onPress={() => setTab('missing')} />
              <Chip label="Forms" active={tab === 'forms'} onPress={() => setTab('forms')} />
            </View>
            <Muted>{data.length.toLocaleString()} entries</Muted>
          </View>
        }
        data={data.slice(0, 500)}
        keyExtractor={(item) => item.entry.key}
        renderItem={({ item }) => (
          <Link href={`/pokemon/${encodeURIComponent(item.entry.key)}`} asChild>
            <View
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>
                {formatDexNumber(item.entry.speciesId)} {item.entry.displayName}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                {item.entry.formName}
                {item.entry.isCostume ? ' · Costume' : ''}
                {item.entry.isRegional ? ' · Regional' : ''}
              </Text>
            </View>
          </Link>
        )}
      />
    </Screen>
  );
}
