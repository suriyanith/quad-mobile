import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { Body, Button, Card, Heading, Screen, TAB_BAR_SPACE, usePalette } from '@/components/ui';
import { useSession } from '@/lib/session';

const KIND_LABEL = {
  connected: 'Connected',
  plan_confirmed: 'Locked in',
  proactive: 'Heads up',
  session_ready: 'Session ready',
  note: 'Note',
} as const;

function timeAgo(at: number): string {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(at).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ActivityScreen() {
  const { studentId } = useSession();
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const items = useQuery(api.activity.list, studentId ? { studentId } : 'skip');
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => {
      clearInterval(id);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTick((t) => t + 1);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <Screen title="Activity" subtitle="What your agent did, live." scroll={false} testID="activity-screen">
      {!studentId ? (
        <Card testID="activity-needs-setup">
          <Body muted>Set up your agent on the Home tab and its activity will show up here.</Body>
        </Card>
      ) : items === undefined ? (
        <Body muted>Loading…</Body>
      ) : (
        <FlatList
          testID="activity-list"
          data={items}
          keyExtractor={(it) => it._id}
          extraData={tick}
          alwaysBounceVertical
          refreshControl={
            <RefreshControl testID="activity-refresh" refreshing={refreshing} onRefresh={onRefresh} tintColor={p.muted} colors={[p.accent]} />
          }
          contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: insets.bottom + TAB_BAR_SPACE }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card testID="activity-empty">
              <Heading>No activity yet</Heading>
              <Body muted>Nothing yet. Text Quad or bump phones with a classmate — updates land here the moment they happen.</Body>
              <Button label="Add a note" testID="activity-empty-notes" variant="secondary" onPress={() => router.navigate('/notes')} />
            </Card>
          }
          renderItem={({ item }) => (
            <Card testID="activity-item">
              <View style={styles.row}>
                <Text style={[styles.kind, { color: p.accent }]}>{KIND_LABEL[item.kind]}</Text>
                <Text style={[styles.time, { color: p.muted }]}>{timeAgo(item.at)}</Text>
              </View>
              <Text style={[styles.itemTitle, { color: p.text }]}>{item.title}</Text>
              {item.body ? <Body muted>{item.body}</Body> : null}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kind: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  time: { fontSize: 13 },
  itemTitle: { fontSize: 17, fontWeight: '600', lineHeight: 23 },
});
