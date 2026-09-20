import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/theme';
import { Screen } from '../../components/ui';

export default function AuthCallbackScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        router.replace('/collection');
        return;
      }
      const url = await Linking.getInitialURL();
      if (url) {
        const parsed = Linking.parse(url);
        const code =
          typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      }
      if (!cancelled) router.replace('/collection');
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.foreground }}>Finishing sign-in…</Text>
      </View>
    </Screen>
  );
}
