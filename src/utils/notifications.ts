import { PriorityTask } from '../types.ts';
import { sounds } from './audio.ts';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export const getNotificationPermissionState = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
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

// Send a desktop notification
export const sendDesktopPush = (
  title: string,
  options?: {
    body?: string;
    tag?: string;
    playSound?: boolean;
    onClick?: () => void;
  }
): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || '',
      icon: '/favicon.ico',
      tag: options?.tag || 'onefocus-reminder',
    });

    if (options?.playSound !== false) {
      sounds.playCommit();
    }

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('Failed to trigger desktop notification:', err);
    return false;
  }
};

// Send priority reminder desktop notification
export const sendPriorityReminderNotification = (
  priority: PriorityTask,
  contextName: string,
  onNotificationClick?: () => void
): boolean => {
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
    onClick: onNotificationClick,
  });
};

// Send immediate test notification
export const sendTestPushNotification = (): boolean => {
  return sendDesktopPush('OneFocus · Desktop Notification Active', {
    body: 'Your custom priority reminders are now successfully linked to your desktop!',
    tag: 'onefocus-test',
    playSound: true,
  });
};
