import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { Medicine } from '../types/medication';

/**
 * Safely resolve expo-notifications only in standalone builds (APK) or bare React Native.
 * In Expo Go, remote push notification modules were removed by Expo in SDK 53+,
 * so loading it causes red console errors in Expo Go.
 */
function getNotifications() {
  if (Platform.OS === 'web' || isRunningInExpoGo()) {
    return null;
  }
  try {
    // Dynamic require so Expo Go never initializes the push token emitter
    return require('expo-notifications');
  } catch {
    return null;
  }
}

let isHandlerConfigured = false;

function ensureNotificationHandlerConfigured() {
  if (isHandlerConfigured) return;
  const Notifications = getNotifications();
  if (Notifications?.setNotificationHandler) {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isHandlerConfigured = true;
    } catch {
      // Graceful fallback
    }
  }
}

/**
 * Request notification permissions from device (Android & iOS).
 * Returns true immediately in Expo Go (relying on in-app engine) without throwing errors.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) {
    return true;
  }

  const Notifications = getNotifications();
  if (!Notifications) return true;

  try {
    ensureNotificationHandlerConfigured();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted' && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medikita-reminders', {
        name: 'Pengingat Minum Obat',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#0D9488',
        sound: 'default',
        enableVibrate: true,
      });
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Notification permission request bypassed:', err);
    return true;
  }
}

/**
 * Schedule recurring daily notifications on local device for all active medicines.
 * In Expo Go: handled by in-app scheduler to avoid Expo Go SDK 53+ remote notification errors.
 * In Standalone APK: uses Android AlarmManager / NotificationManager for true offline OS reminders.
 */
export async function scheduleMedicationNotifications(medicines: Medicine[]): Promise<void> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) {
    return;
  }

  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    ensureNotificationHandlerConfigured();
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const med of medicines) {
      if (!med.active) continue;

      for (const time of med.times) {
        const [hourStr, minStr] = time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);

        if (isNaN(hour) || isNaN(minute)) continue;

        const mealDesc =
          med.mealTiming === 'sesudah'
            ? 'Sesudah Makan'
            : med.mealTiming === 'sebelum'
            ? 'Sebelum Makan'
            : med.mealTiming === 'bersama'
            ? 'Bersama Makanan'
            : 'Kapan Saja';

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Waktunya Minum: ${med.name}`,
            body: `${med.dose} · ${mealDesc}${med.notes ? ` (${med.notes})` : ''}`,
            data: { medicineId: med.id, time },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: 'medikita-reminders',
          },
        });
      }
    }
  } catch (err) {
    console.warn('Medication notification scheduling bypassed in current environment:', err);
  }
}

/**
 * Trigger an instant test notification to verify sound and vibration.
 */
export async function triggerTestNotification(): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) {
    // In Expo Go: return cleanly, App.tsx handles feedback with haptics + toast
    return;
  }

  try {
    ensureNotificationHandlerConfigured();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Uji Coba Pengingat Obat Medikita',
        body: 'Pengingat berhasil aktif! Anda akan diingatkan tepat waktu sesuai jadwal.',
        sound: true,
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('Instant notification error:', err);
  }
}
