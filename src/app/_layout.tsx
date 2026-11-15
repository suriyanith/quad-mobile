import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Body, Card, Heading, Screen } from '@/components/ui';
import { CONVEX_URL } from '@/lib/config';
import { SessionProvider } from '@/lib/session';

const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL, { unsavedChangesWarning: false }) : null;

function ConvexNotConfigured() {
  return (
    <Screen title="Quad" subtitle="Convex not configured" testID="convex-not-configured">
      <Card>
        <Heading>One step left</Heading>
        <Body muted>
          This build has no EXPO_PUBLIC_CONVEX_URL, so the live feed and notes can't load. Run `npx convex dev --once` in the
          project (it writes the URL to .env.local), then restart `npx expo start`.
        </Body>
      </Card>
    </Screen>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      {convex ? (
        <ConvexProvider client={convex}>
          <SessionProvider>
            <AppTabs />
          </SessionProvider>
        </ConvexProvider>
      ) : (
        <ConvexNotConfigured />
      )}
    </ThemeProvider>
  );
}
