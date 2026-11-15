import { useQuery } from 'convex/react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { Body, Card, Screen, TAB_BAR_SPACE, usePalette } from '@/components/ui';
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
  const items = useQuery(api.activity.list, studentId ? { studentId } : 'skip');

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
          contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: insets.bottom + TAB_BAR_SPACE }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card testID="activity-empty">
              <Body muted>Nothing yet. Text Quad or bump phones with a classmate — updates land here the moment they happen.</Body>
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
