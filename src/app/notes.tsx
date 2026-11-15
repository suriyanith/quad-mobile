import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../convex/_generated/api';
import { Body, Button, Card, ErrorText, Screen, TAB_BAR_SPACE, usePalette } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function NotesScreen() {
  const { deviceId } = useSession();
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const notes = useQuery(api.notes.list, deviceId ? { deviceId } : 'skip');
  const add = useMutation(api.notes.add);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const value = text.trim();
    if (!value || !deviceId || busy) return;
    setBusy(true);
    setError(null);
    try {
      await add({ deviceId, text: value });
      setText('');
    } catch {
      setError("Couldn't save that note. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Notes" subtitle="Quick things to remember." scroll={false} testID="notes-screen">
      <View style={styles.row}>
        <TextInput
          testID="note-input"
          accessibilityLabel="New note"
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="Add a note"
          placeholderTextColor={p.muted}
          returnKeyType="done"
          maxLength={500}
          style={[styles.input, { color: p.text, backgroundColor: p.card, borderColor: p.border }]}
        />
        <Button testID="note-add" label="Add" accessibilityLabel="Add note" onPress={submit} disabled={!text.trim() || !deviceId} busy={busy} />
      </View>
      {error ? <ErrorText testID="note-error">{error}</ErrorText> : null}
      <FlatList
        testID="note-list"
        data={notes ?? []}
        keyExtractor={(n) => n._id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: insets.bottom + TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Body muted testID="note-empty">
            {notes === undefined ? 'Loading…' : 'No notes yet. Add your first one above.'}
          </Body>
        }
        renderItem={({ item }) => (
          <Card testID="note-item">
            <Body>{item.text}</Body>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 },
  input: { flex: 1, minHeight: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 17 },
});
