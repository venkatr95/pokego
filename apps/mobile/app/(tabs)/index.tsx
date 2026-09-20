import { Linking, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { webPath } from '../../lib/config';
import { useQuizStore } from '../../store/quiz-store';
import { useAppTheme } from '../../lib/theme';
import { Card, Muted, OutlineButton, PrimaryButton, Screen, Title } from '../../components/ui';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const card = useQuizStore((s) => s.card);
  const reset = useQuizStore((s) => s.reset);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Title>PokéYou</Title>
        <Muted>
          Discover your Pokémon personality, generate a trading card, and track your Pokémon GO
          collection — all on your phone.
        </Muted>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>
            Personality Quiz
          </Text>
          <Muted>Answer 5 questions and meet your matched Pokémon.</Muted>
          <PrimaryButton
            label={card ? 'Retake quiz' : 'Start quiz'}
            onPress={() => {
              if (card) reset();
              router.push('/quiz');
            }}
          />
          {card && (
            <OutlineButton label="View last card" onPress={() => router.push('/result')} />
          )}
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>
            Pokémon GO Collector
          </Text>
          <Muted>Pokédex, goals, evolutions, forms, and cloud sync.</Muted>
          <PrimaryButton label="Open Pokédex" onPress={() => router.push('/pokedex')} />
          <OutlineButton label="Manage collection" onPress={() => router.push('/collection')} />
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>
            On the web
          </Text>
          <Muted>
            Premium card themes, AR/3D viewer, and checkout stay on the website for now.
          </Muted>
          <OutlineButton
            label="Open PokéYou website"
            onPress={() => void Linking.openURL(webPath('/'))}
          />
          <OutlineButton
            label="Open AR / 3D card (web)"
            onPress={() => void Linking.openURL(webPath('/card'))}
          />
        </Card>

        <OutlineButton label="Goals & forms" onPress={() => router.push('/explore')} />
        <OutlineButton label="Profile" onPress={() => router.push('/profile')} />
      </ScrollView>
    </Screen>
  );
}
