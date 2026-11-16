import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const fire = (play: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  try {
    play().catch(() => {});
  } catch {}
};

export const bumpSent = () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const success = () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warning = () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
