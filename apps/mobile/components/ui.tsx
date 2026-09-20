import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { useAppTheme } from '../lib/theme';

export function Screen({ children, style, ...rest }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 14,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: '700' }}>
      {children}
    </Text>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: colors.primary,
        opacity: disabled ? 0.45 : 1,
        minHeight: 48,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: colors.card,
        opacity: disabled ? 0.45 : 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.foreground, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const { colors } = useAppTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.foreground,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 15,
        },
        props.style,
      ]}
    />
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: active ? colors.primary : colors.accent,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          color: active ? colors.primaryText : colors.foreground,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Loading() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const { colors } = useAppTheme();
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <View
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct}%` as unknown as number,
          height: '100%',
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
