import * as Haptics from 'expo-haptics';

/**
 * Trigger haptic feedback for successful actions (e.g., dose taken, refill added).
 */
export async function triggerSuccessFeedback(enabled: boolean = true) {
  if (!enabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics might not be supported on web or some emulators
  }
}

/**
 * Trigger warning haptic feedback (e.g., skip, snooze, low stock alert).
 */
export async function triggerWarningFeedback(enabled: boolean = true) {
  if (!enabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Graceful fallback
  }
}

/**
 * Trigger light selection haptic feedback (e.g. tabs, buttons).
 */
export async function triggerSelectionFeedback(enabled: boolean = true) {
  if (!enabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Graceful fallback
  }
}
