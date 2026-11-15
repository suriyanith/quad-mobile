import { NativeTabs } from 'expo-router/native-tabs';

import { usePalette } from '@/components/ui';

export default function AppTabs() {
  const p = usePalette();
  return (
    <NativeTabs backgroundColor={p.card} tintColor={p.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bolt.fill" md="bolt" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bump">
        <NativeTabs.Trigger.Label>Bump</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="iphone.radiowaves.left.and.right" md="vibration" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notes">
        <NativeTabs.Trigger.Label>Notes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="note.text" md="notes" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
