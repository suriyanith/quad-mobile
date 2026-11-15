/** Small phone-first UI kit: system font, generous spacing, light/dark. */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const palettes = {
  light: {
    bg: '#F6F6F8',
    card: '#FFFFFF',
    text: '#111114',
    muted: '#63666E',
    border: '#E3E4E8',
    accent: '#2F5BEA',
    onAccent: '#FFFFFF',
    good: '#157F4B',
    goodBg: '#E3F5EA',
    warn: '#8A5A00',
    warnBg: '#FCF0D6',
    danger: '#B3261E',
  },
  dark: {
    bg: '#0B0B0D',
    card: '#17181B',
    text: '#F4F4F6',
    muted: '#A1A4AC',
    border: '#2A2C31',
    accent: '#7C9BFF',
    onAccent: '#0B0B0D',
    good: '#6FDCA0',
    goodBg: '#11301F',
    warn: '#F2C66B',
    warnBg: '#33280E',
    danger: '#FF8A80',
  },
} as const;

export type Palette = { [K in keyof typeof palettes.light]: string };

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

export const TAB_BAR_SPACE = 96;

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  testID,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  testID?: string;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const header = (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.title, { color: p.text }]}>
        {title}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, { color: p.muted }]}>{subtitle}</Text> : null}
    </View>
  );
  if (!scroll) {
    return (
      <View testID={testID} style={[styles.fill, { backgroundColor: p.bg, paddingTop: insets.top + 12, paddingHorizontal: 20 }]}>
        {header}
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      testID={testID}
      style={[styles.fill, { backgroundColor: p.bg }]}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + TAB_BAR_SPACE, gap: 16 }}>
      {header}
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, testID }: { children: React.ReactNode; style?: ViewStyle; testID?: string }) {
  const p = usePalette();
  return (
    <View testID={testID} style={[styles.card, { backgroundColor: p.card, borderColor: p.border }, style]}>
      {children}
    </View>
  );
}

export function Body({ children, muted, testID }: { children: React.ReactNode; muted?: boolean; testID?: string }) {
  const p = usePalette();
  return (
    <Text testID={testID} style={[styles.body, { color: muted ? p.muted : p.text }]}>
      {children}
    </Text>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  const p = usePalette();
  return <Text style={[styles.heading, { color: p.text }]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  testID,
  variant = 'primary',
  big,
  disabled,
  busy,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  testID: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  big?: boolean;
  disabled?: boolean;
  busy?: boolean;
  accessibilityLabel?: string;
}) {
  const p = usePalette();
  const off = disabled || busy;
  const bg = variant === 'primary' ? p.accent : variant === 'secondary' ? p.card : 'transparent';
  const fg = variant === 'primary' ? p.onAccent : variant === 'ghost' ? p.muted : p.text;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        big && styles.buttonBig,
        { backgroundColor: bg, borderColor: variant === 'secondary' ? p.border : 'transparent', opacity: off ? 0.5 : pressed ? 0.8 : 1 },
      ]}>
      {busy ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, big && styles.buttonTextBig, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, testID, ...rest }: { label: string; testID: string } & TextInputProps) {
  const p = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: p.muted }]}>{label}</Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.text, backgroundColor: p.bg, borderColor: p.border }]}
        {...rest}
      />
    </View>
  );
}

export function Badge({ label, tone, testID }: { label: string; tone: 'good' | 'warn'; testID?: string }) {
  const p = usePalette();
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={label}
      style={[styles.badge, { backgroundColor: tone === 'good' ? p.goodBg : p.warnBg }]}>
      <Text style={[styles.badgeText, { color: tone === 'good' ? p.good : p.warn }]}>{label}</Text>
    </View>
  );
}

export function ErrorText({ children, testID }: { children: React.ReactNode; testID?: string }) {
  const p = usePalette();
  return (
    <Text testID={testID} accessibilityRole="alert" style={[styles.body, { color: p.danger }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 23 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  card: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 18, gap: 12 },
  button: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  buttonBig: { minHeight: 64, borderRadius: 18 },
  buttonText: { fontSize: 17, fontWeight: '600' },
  buttonTextBig: { fontSize: 20, fontWeight: '700' },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 17 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 14, fontWeight: '600' },
});
