import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useGoals } from '../../lib/use-collector';
import { useAppTheme } from '../../lib/theme';
import { Card, Muted, Screen, Title } from '../../components/ui';

export default function GoalsScreen() {
  const { colors } = useAppTheme();
  const { summary, collection } = useGoals();

  const cards = [
    { label: 'Ready to evolve', count: summary.readyToEvolve, href: '/evolutions?view=ready' },
    {
      label: 'Incomplete families',
      count: summary.incompleteFamilies,
      href: '/evolutions?view=unevolved',
    },
    { label: 'Missing Pokédex', count: summary.missingPokedex, href: '/explore?tab=missing' },
    { label: 'Missing shiny', count: summary.missingShiny, href: '/explore?tab=missing' },
    { label: 'Missing forms', count: summary.missingForms, href: '/explore?tab=forms' },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Title>Your Goals</Title>
        {!collection && (
          <Muted>Import a collection on the Collection tab to unlock personal goals.</Muted>
        )}
        {cards.map((c) => (
          <Link key={c.label} href={c.href as never} asChild>
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>{c.label}</Text>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '700' }}>
                {c.count}
              </Text>
            </Card>
          </Link>
        ))}

        <Title>Next Goals</Title>
        {summary.nextGoals.length === 0 ? (
          <Muted>No next goals yet.</Muted>
        ) : (
          summary.nextGoals.map((g, i) => (
            <Card key={g.id}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{i + 1}.</Text>
              <Text style={{ color: colors.foreground, fontWeight: '600', marginTop: 4 }}>
                {g.title}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 2, fontSize: 13 }}>{g.subtitle}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
