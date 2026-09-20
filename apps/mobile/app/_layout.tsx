import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppTheme } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useCollectionStore } from '../store/collection-store';

export default function RootLayout() {
  const { isDark, colors } = useAppTheme();
  const bindAuthUser = useCollectionStore((s) => s.bindAuthUser);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      void bindAuthUser(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      void bindAuthUser(session?.user?.id ?? null);
    });

    const handleUrl = async (url: string) => {
      if (!url.includes('auth/callback') || !supabase) return;
      try {
        const parsed = Linking.parse(url);
        const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // ignore malformed deep links
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, [bindAuthUser]);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pokemon/[key]" options={{ title: 'Details' }} />
        <Stack.Screen name="result" options={{ title: 'Your Card' }} />
        <Stack.Screen name="auth/callback" options={{ title: 'Signing in…' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
