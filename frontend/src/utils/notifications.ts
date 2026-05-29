import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const SCROLL_GUARD_MINUTES = 20;
const GUARD_ID_KEY = "doo-scroll-guard";

export const NOTIF_TITLE = "Doo";
export const NOTIF_BODY =
  "Sa fait 20 min que tu scroll, viens t'amuser un peu dans le vrai monde";

// Foreground presentation: show banner + play sound even when app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("scroll-guard", {
      name: "Anti-doomscroll",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#766675",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function getPermissionState() {
  if (Platform.OS === "web") return { granted: false, canAskAgain: false };
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted, canAskAgain };
}

// Schedules the anti-scroll reminder after `minutes`. Cancels any existing one.
export async function scheduleScrollGuard(
  minutes: number = SCROLL_GUARD_MINUTES,
): Promise<string | null> {
  if (Platform.OS === "web") return null;
  await cancelScrollGuard();
  const id = await Notifications.scheduleNotificationAsync({
    identifier: GUARD_ID_KEY,
    content: {
      title: NOTIF_TITLE,
      body: NOTIF_BODY,
      data: { screen: "/" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(minutes * 60)),
    },
  });
  return id;
}

export async function cancelScrollGuard(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(GUARD_ID_KEY);
  } catch {
    // no-op: nothing scheduled
  }
}

// Fires the exact reminder a couple seconds out so the flow can be demoed
// without waiting 20 real minutes.
export async function sendTestNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: NOTIF_TITLE,
      body: NOTIF_BODY,
      data: { screen: "/" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
