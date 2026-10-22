import { PriorityTask } from '../types.ts';
import { sounds } from './audio.ts';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationResult {
  success: boolean;
  method: 'service_worker' | 'notification_api' | 'tab_title' | 'none';
  reason?: string;
  isBrave?: boolean;
}

// Detect whether the current browser is Brave
let cachedIsBrave: boolean | null = null;
export const isBraveBrowser = async (): Promise<boolean> => {
  if (cachedIsBrave !== null) return cachedIsBrave;
  if (typeof window === 'undefined' || !navigator) {
    cachedIsBrave = false;
    return false;
  }
  try {
    const nav = navigator as any;
    if (nav.brave && typeof nav.brave.isBrave === 'function') {
      const result = await nav.brave.isBrave();
      cachedIsBrave = Boolean(result);
      return cachedIsBrave;
    }
  } catch {
    // fallback
  }
  cachedIsBrave = false;
  return false;
};

// Check if running inside an iframe
export const isRunningInIframe = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
};

// Tab Title Flashing Alert (bulletproof fallback when Brave suppresses OS notifications)
let titleFlashTimer: ReturnType<typeof setInterval> | null = null;
let originalPageTitle: string = typeof document !== 'undefined' ? document.title : 'OneFocus';

export const stopTabTitleAlert = (): void => {
  if (titleFlashTimer) {
    clearInterval(titleFlashTimer);
    titleFlashTimer = null;
  }
  if (typeof document !== 'undefined') {
    document.title = originalPageTitle;
  }
};

export const startTabTitleAlert = (alertText: string, maxDurationMs = 25000): void => {
  if (typeof document === 'undefined') return;

  // Clear any existing flash
  stopTabTitleAlert();
  originalPageTitle = document.title.includes('🔔') ? 'OneFocus — The One Thing Protocol' : document.title;

  let showAlt = true;
  const cleanAlert = alertText.length > 30 ? `${alertText.slice(0, 30)}…` : alertText;

  titleFlashTimer = setInterval(() => {
    document.title = showAlt ? `🔔 (1) ${cleanAlert}` : `● OneFocus`;
    showAlt = !showAlt;
  }, 900);

  // Stop flashing as soon as the user focuses the window or clicks anywhere
  const onFocusOrClick = () => {
    stopTabTitleAlert();
    window.removeEventListener('focus', onFocusOrClick);
    window.removeEventListener('click', onFocusOrClick);
  };
  window.addEventListener('focus', onFocusOrClick);
  window.addEventListener('click', onFocusOrClick);

  // Safety timeout to automatically stop flashing after maxDurationMs
  setTimeout(() => {
    stopTabTitleAlert();
  }, maxDurationMs);
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

// Send a desktop notification with multi-tier fallbacks:
// Tier 1: ServiceWorker showNotification()
// Tier 2: Notification API constructor
// Tier 3: Browser Tab Title Flashing Alert (essential for Brave shields / background tabs)
// Tier 4: In-app sound chime
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
  const isBrave = await isBraveBrowser();

  // 1. Play sound chime if requested
  if (options?.playSound !== false) {
    sounds.playCommit();
  }

  // 2. Start tab title alert if page is not focused or running in Brave
  const isPageBackgrounded =
    typeof document !== 'undefined' && (document.hidden || !document.hasFocus());
  if (isPageBackgrounded) {
    startTabTitleAlert(options?.body || title);
  }

  // 3. Check browser support
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      success: false,
      method: 'tab_title',
      reason: 'Browser does not support the HTML5 Notification API. Tab title chime activated.',
      isBrave,
    };
  }

  // 4. Check permission status
  if (Notification.permission !== 'granted') {
    const reasonMsg = isBrave
      ? `Brave Shields currently set notifications to "${Notification.permission}". Click the Brave Shields/Lock icon in the address bar and toggle Notifications to "Allow".`
      : `Notification permission is "${Notification.permission}". Please grant permission in browser settings.`;

    return {
      success: false,
      method: 'tab_title',
      reason: reasonMsg,
      isBrave,
    };
  }

  // 5. Primary Strategy: ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = (await initServiceWorker()) || undefined;
      }

      if (reg && typeof reg.showNotification === 'function') {
        try {
          await reg.showNotification(title, {
            body: options?.body || '',
            tag: options?.tag || 'onefocus-reminder',
            icon: '/icon.svg',
            badge: '/icon.svg',
            requireInteraction: options?.requireInteraction ?? true,
            silent: false,
          });
          return { success: true, method: 'service_worker', isBrave };
        } catch {
          // If rich options failed in Brave, retry with minimal payload
          await reg.showNotification(title, {
            body: options?.body || '',
          });
          return { success: true, method: 'service_worker', isBrave };
        }
      }
    } catch (swErr) {
      console.warn('[OneFocus] ServiceWorker showNotification failed, attempting Notification constructor:', swErr);
    }
  }

  // 6. Secondary Strategy: Traditional Notification constructor
  try {
    let notification: Notification;
    try {
      notification = new Notification(title, {
        body: options?.body || '',
        icon: '/icon.svg',
        tag: options?.tag || 'onefocus-reminder',
        requireInteraction: options?.requireInteraction ?? true,
      });
    } catch {
      // Retry with minimal options if strict browser rejected options
      notification = new Notification(title, {
        body: options?.body || '',
      });
    }

    notification.onclick = () => {
      window.focus();
      stopTabTitleAlert();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return { success: true, method: 'notification_api', isBrave };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error('[OneFocus] Failed to create notification via Notification constructor:', errorMsg);

    const isIframe = isRunningInIframe();
    let userReason = errorMsg;

    if (errorMsg.includes('Illegal constructor') || isIframe) {
      userReason = isBrave
        ? 'Brave blocks native notifications inside preview iframes. Open OneFocus in a standalone window for native OS banners.'
        : 'Cross-origin iframe restriction: Open app in full standalone window to send native OS notifications.';
    } else if (isBrave) {
      userReason = 'Brave suppressed the OS banner. Tab flashing and audio chime are active. Check brave://settings/privacy for push permissions.';
    }

    return {
      success: false,
      method: 'tab_title',
      reason: userReason,
      isBrave,
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
    body: 'Your custom priority reminders are now successfully linked to your desktop and tab!',
    tag: 'onefocus-test',
    playSound: true,
    requireInteraction: true,
  });
};

