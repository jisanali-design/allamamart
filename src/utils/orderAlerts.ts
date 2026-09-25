import { soundFx } from './sound';

const STORAGE_KEY = 'allama_admin_notifications_enabled';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function areAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  // Default to enabled if user has already granted notification permission
  return isNotificationSupported() && Notification.permission === 'granted';
}

export function setAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Requests browser push notification permission and unlocks the Web Audio context.
 * Called when the admin clicks "🔔 Enable Sound & Order Notifications".
 */
export async function enableOrderNotifications(): Promise<{
  permission: NotificationPermission | 'unsupported';
  enabled: boolean;
}> {
  // 1. Unlock browser audio context via user interaction
  soundFx.unlockAudio();

  let perm: NotificationPermission | 'unsupported' = 'unsupported';

  // 2. Request browser push notification permission
  if (isNotificationSupported()) {
    try {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        perm = await Notification.requestPermission();
      } else {
        perm = Notification.permission;
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      perm = Notification.permission;
    }
  }

  // Mark alerts enabled in storage
  setAlertsEnabled(true);

  // 3. Play a test chime & vibration to confirm audio is active
  soundFx.playOrderAlert();

  // 4. Send a test confirmation notification if granted
  if (perm === 'granted') {
    try {
      const notif = new Notification("🔔 Allama Mart Alerts Activated!", {
        body: "You will hear a loud chime & receive instant alerts when orders are placed.",
        icon: "/favicon.ico"
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Failed to display activation notification:', e);
    }
  }

  return { permission: perm, enabled: true };
}

/**
 * Dispatches both loud audio chime, phone vibration, and system push notification
 * when a new order event is received.
 */
export function triggerNewOrderAlert(order: {
  roomNumber: string;
  totalAmount: number;
  orderNumber?: string;
}): void {
  // Check if alerts are enabled
  if (!areAlertsEnabled()) return;

  // 1. Play loud alert chime and trigger vibration: navigator.vibrate([300, 100, 300, 100, 500])
  soundFx.playOrderAlert();

  // 2. Trigger browser push notification (even if admin is in another tab or app)
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification("🚨 New Allama Mart Order!", {
        body: `Room ${order.roomNumber} - Total: ₹${order.totalAmount}`,
        icon: "/favicon.ico"
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Error triggering order notification:', err);
    }
  }
}
