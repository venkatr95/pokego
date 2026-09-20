import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { QUIZ_COPY } from '../../lib/quiz-data';
import { generateCardFromAnswers, searchPokemon, type PokemonSearchHit } from '../../lib/api';
import { useQuizStore } from '../../store/quiz-store';
import { useAppTheme } from '../../lib/theme';
import {
  Card,
  Field,
  Muted,
  OutlineButton,
  PrimaryButton,
  ProgressBar,
  Screen,
  Title,
} from '../../components/ui';

const CHOICE_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;
const TOTAL = 7;

export default function QuizScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const answers = useQuizStore((s) => s.answers);
  const isGenerating = useQuizStore((s) => s.isGenerating);
  const error = useQuizStore((s) => s.error);
  const setName = useQuizStore((s) => s.setName);
  const setFavorite = useQuizStore((s) => s.setFavorite);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const setGenerating = useQuizStore((s) => s.setGenerating);
  const setError = useQuizStore((s) => s.setError);
  const setCard = useQuizStore((s) => s.setCard);
  const setStep = useQuizStore((s) => s.setStep);

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PokemonSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      void searchPokemon(q, 15)
        .then(setHits)
        .catch(() => setHits([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const answeredCount = useMemo(() => {
    let n = 0;
    if (answers.name.trim().length >= 2) n += 1;
    if (answers.favoritePokemonId) n += 1;
    for (const k of CHOICE_KEYS) if (answers[k]) n += 1;
    return n;
  }, [answers]);

  const canSubmit = answeredCount === TOTAL;

  async function finishQuiz() {
    setGenerating(true);
    setError(null);
    try {
      const card = await generateCardFromAnswers(answers);
      setCard(card);
      setStep('complete');
      router.push('/result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  const stickyPad = Math.max(insets.bottom, 12) + 76;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            gap: 14,
            paddingBottom: stickyPad,
          }}
        >
          <Title>Personality Quiz</Title>
          <Muted>Answer everything on one page, then generate your card.</Muted>

          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.foreground, fontWeight: '700' }}>Progress</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                {answeredCount}/{TOTAL}
              </Text>
            </View>
            <ProgressBar value={answeredCount} max={TOTAL} />
          </Card>

          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16 }}>
              {QUIZ_COPY.name.question}
            </Text>
            <Field
              value={answers.name}
              onChangeText={setName}
              placeholder="Trainer name"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Card>

          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16 }}>
              {QUIZ_COPY['favorite-pokemon'].question}
            </Text>
            <Field
              value={query}
              onChangeText={setQuery}
              placeholder="Search Pokémon…"
              autoCorrect={false}
              returnKeyType="search"
            />
            {answers.favoritePokemonName ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: colors.accent,
                }}
              >
                <Muted>Selected: {answers.favoritePokemonName}</Muted>
                <Pressable
                  onPress={() => setFavorite(null, null)}
                  hitSlop={8}
                  style={{ minHeight: 36, minWidth: 36, justifyContent: 'center' }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Clear</Text>
                </Pressable>
              </View>
            ) : (
              <Muted>Pick a buddy from the search results.</Muted>
            )}
            {searching ? <ActivityIndicator color={colors.primary} /> : null}
            <FlatList
              data={hits}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = answers.favoritePokemonId === item.id;
                return (
                  <Pressable
                    onPress={() => setFavorite(item.id, item.displayName)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 52,
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: selected ? colors.accent : 'transparent',
                    }}
                  >
                    {item.sprite ? (
                      <Image source={{ uri: item.sprite }} style={{ width: 40, height: 40 }} />
                    ) : (
                      <View style={{ width: 40, height: 40 }} />
                    )}
                    <Text style={{ color: colors.foreground, fontWeight: '600', flex: 1 }}>
                      {item.displayName}
                    </Text>
                    {selected ? (
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                        Selected
                      </Text>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Card>

          {CHOICE_KEYS.map((key) => {
            const copy = QUIZ_COPY[key];
            return (
              <Card key={key} style={{ gap: 10 }}>
                <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16 }}>
                  {copy.question}
                </Text>
                <View style={{ gap: 8 }}>
                  {copy.options?.map((opt) => {
                    const selected = answers[key] === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setAnswer(key, opt.id)}
                        style={{
                          minHeight: 52,
                          paddingHorizontal: 14,
                          paddingVertical: 14,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.accent : colors.card,
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: '600' }}>
                          {opt.icon ? `${opt.icon} ` : ''}
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            );
          })}

          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
          <OutlineButton label="Back home" onPress={() => router.push('/')} />
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            gap: 6,
          }}
        >
          <PrimaryButton
            label={isGenerating ? 'Generating…' : 'Generate my Pokémon card'}
            disabled={!canSubmit || isGenerating}
            onPress={() => void finishQuiz()}
          />
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
            {canSubmit
              ? 'All set — tap generate when ready.'
              : `${answeredCount}/${TOTAL} complete — fill every section above`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
