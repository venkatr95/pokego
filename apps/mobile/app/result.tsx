import { Image, Linking, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spriteUrl } from '@pokeyou/pokemon-go-core';
import { webPath } from '../lib/config';
import { useQuizStore } from '../store/quiz-store';
import { useAppTheme } from '../lib/theme';
import { Card, Muted, OutlineButton, PrimaryButton, Screen, Title } from '../components/ui';

export default function ResultScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const card = useQuizStore((s) => s.card);
  const reset = useQuizStore((s) => s.reset);

  if (!card) {
    return (
      <Screen>
        <View style={{ padding: 16, gap: 12 }}>
          <Title>No card yet</Title>
          <Muted>Take the quiz to generate your personality card.</Muted>
          <PrimaryButton label="Start quiz" onPress={() => router.push('/quiz')} />
        </View>
      </Screen>
    );
  }

  const art =
    card.matchedPokemon.sprites?.official_artwork ||
    card.matchedPokemon.sprites?.front_default ||
    spriteUrl(card.matchedPokemon.id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <Title>Your Card</Title>
        <Muted>
          {card.cardNumber} · {card.rarity}
        </Muted>

        <Card style={{ alignItems: 'center', gap: 10 }}>
          <Image source={{ uri: art }} style={{ width: 180, height: 180 }} />
          <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '800' }}>
            {card.matchedPokemon.displayName}
          </Text>
          <Muted>{card.matchedPokemon.types?.join(' · ')}</Muted>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>
            Trainer {card.trainerName}
          </Text>
          {card.personality?.trainerArchetype ? (
            <Muted>{card.personality.trainerArchetype}</Muted>
          ) : null}
        </Card>

        <Card style={{ gap: 6 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700' }}>Match</Text>
          <Muted>Score {Math.round(card.matchScore)}</Muted>
          <Muted>XP level {card.xpLevel}</Muted>
          {card.favoriteWon ? <Muted>Your buddy won the match!</Muted> : null}
          {card.personality?.dominantTraits?.length ? (
            <Muted>Traits: {card.personality.dominantTraits.join(', ')}</Muted>
          ) : null}
          {card.personality?.battleStyle ? (
            <Muted>Battle style: {card.personality.battleStyle}</Muted>
          ) : null}
        </Card>

        {(card.aiData?.personalitySummary || card.aiData?.motivationalQuote) && (
          <Card style={{ gap: 8 }}>
            {card.aiData.trainerTitle ? (
              <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                {card.aiData.trainerTitle}
              </Text>
            ) : null}
            {card.aiData.personalitySummary ? (
              <Muted>{card.aiData.personalitySummary}</Muted>
            ) : null}
            {card.aiData.motivationalQuote ? (
              <Text style={{ color: colors.foreground, fontStyle: 'italic' }}>
                “{card.aiData.motivationalQuote}”
              </Text>
            ) : null}
          </Card>
        )}

        <PrimaryButton label="Back home" onPress={() => router.push('/')} />
        <OutlineButton
          label="Retake quiz"
          onPress={() => {
            reset();
            router.push('/quiz');
          }}
        />
        <OutlineButton
          label="Open premium / AR card on web"
          onPress={() => void Linking.openURL(webPath('/card'))}
        />
      </ScrollView>
    </Screen>
  );
}
