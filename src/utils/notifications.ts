import { PriorityTask } from '../types.ts';
import { sounds } from './audio.ts';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationResult {
  success: boolean;
  method: 'service_worker' | 'notification_api' | 'none';
  reason?: string;
}

// Check if running inside an iframe
export const isRunningInIframe = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
};

// Register Service Worker for reliable native background push
let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export const initServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (swRegistrationPromise) {
    return swRegistrationPromise;
  }

  swRegistrationPromise = (async () => {
    try {
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) {
        return existing;
      }
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.warn('[OneFocus] Service Worker registration failed or unsupported in this context:', err);
      return null;
    }
  })();

  return swRegistrationPromise;
};

// Get current permission status
export const getNotificationPermissionState = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

// Request notification permission from browser
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    initServiceWorker().catch(() => {});

    let permission: NotificationPermission;
    if (typeof Notification.requestPermission === 'function') {
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }
    } else {
      permission = Notification.permission;
    }

    return permission as NotificationPermissionState;
  } catch (err) {
    console.error('[OneFocus] Error requesting notification permission:', err);
    return 'denied';
  }
};

// Format 'HH:mm' to readable 12-hour format e.g. '9:30 AM'
export const formatTimeString = (time24: string): string => {
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (isNaN(hour) || isNaN(min)) return time24;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMin = min < 10 ? `0${min}` : `${min}`;
  return `${displayHour}:${displayMin} ${period}`;
};

// Send a desktop notification using ServiceWorker first, falling back to new Notification()
export const sendDesktopPush = async (
  title: string,
  options?: {
    body?: string;
    tag?: string;
    playSound?: boolean;
    requireInteraction?: boolean;
    onClick?: () => void;
  }
): Promise<NotificationResult> => {
  if (options?.playSound !== false) {
    sounds.playCommit();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, method: 'none', reason: 'Browser does not support notifications' };
  }

  if (Notification.permission !== 'granted') {
    return {
      success: false,
      method: 'none',
      reason: `Notification permission is "${Notification.permission}". Please grant permission in browser settings.`,
    };
  }

  // 1. Primary Strategy: ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = (await initServiceWorker()) || undefined;
      }

      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, {
          body: options?.body || '',
          tag: options?.tag || 'onefocus-reminder',
          icon: '/icon.svg',
          badge: '/icon.svg',
          requireInteraction: options?.requireInteraction ?? true,
          silent: true,
        });

        return { success: true, method: 'service_worker' };
      }
    } catch (swErr) {
      console.warn('[OneFocus] ServiceWorker showNotification attempt failed, falling back:', swErr);
    }
  }

  // 2. Fallback Strategy: Traditional Notification constructor
  try {
    const notification = new Notification(title, {
      body: options?.body || '',
      icon: '/icon.svg',
      tag: options?.tag || 'onefocus-reminder',
      requireInteraction: options?.requireInteraction ?? true,
      silent: true,
    });

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return { success: true, method: 'notification_api' };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error('[OneFocus] Failed to create notification via Notification constructor:', errorMsg);
    return {
      success: false,
      method: 'none',
      reason: errorMsg.includes('Illegal constructor')
        ? 'Cross-origin iframe restriction: Open app in full window to send native OS notifications.'
        : errorMsg,
    };
  }
};

// Send priority reminder desktop notification
export const sendPriorityReminderNotification = async (
  priority: PriorityTask,
  contextName: string,
  onNotificationClick?: () => void
): Promise<NotificationResult> => {
  const hasTitle = priority.title && priority.title.trim().length > 0;
  const title = priority.completed
    ? `OneFocus · Priority Done! (${contextName.toUpperCase()})`
    : `OneFocus · Priority Reminder (${contextName.toUpperCase()})`;

  const body = priority.completed
    ? `Great job! You've completed "${priority.title || 'your main priority'}". The day is won.`
    : hasTitle
    ? `Current Focus: "${priority.title}" (${priority.durationMinutes}m planned). Stay locked in!`
    : 'Reminder: Set your ONE crucial priority for today to win the day!';

  return sendDesktopPush(title, {
    body,
    tag: 'onefocus-priority-checkin',
    playSound: true,
    requireInteraction: true,
    onClick: onNotificationClick,
  });
};

// Send immediate test notification
export const sendTestPushNotification = async (): Promise<NotificationResult> => {
  return sendDesktopPush('OneFocus · Desktop Notification Active', {
    body: 'Your custom priority reminders are now successfully linked to your desktop!',
    tag: 'onefocus-test',
    playSound: true,
    requireInteraction: true,
  });
};
