import { AppState, ReminderSettings } from '../types.ts';

export const INITIAL_REMINDERS: ReminderSettings = {
  enabled: true,
  soundEnabled: true,
  desktopPushEnabled: false,
  specificTimes: ['09:00', '12:00', '15:00', '18:00'],
  intervalEnabled: false,
  intervalMinutes: 45,
};

export const INITIAL_STATE: AppState = {
  screenMode: 'setup',
  shelfOpen: false,
  soundEnabled: true,
  reminders: INITIAL_REMINDERS,
  priority: {
    id: 'priority-1',
    title: '',
    durationMinutes: 60,
    completed: false,
    completedTimeMinutes: 60,
  },
  secondaryTasks: [
    {
      id: 'secondary-2',
      title: '',
      durationMinutes: 0,
      completed: false,
      optional: true,
    },
    {
      id: 'secondary-3',
      title: '',
      durationMinutes: 0,
      completed: false,
      optional: true,
    },
  ],
  shelf: [
    {
      id: 'shelf-1',
      title: 'Reply to Alex re: API migration review',
      durationMinutes: 5,
      completed: false,
    },
    {
      id: 'shelf-2',
      title: 'Submit expense receipts for October',
      durationMinutes: 10,
      completed: false,
    },
    {
      id: 'shelf-3',
      title: 'Schedule 1:1 sync',
      durationMinutes: 10,
      completed: false,
    },
    {
      id: 'shelf-4',
      title: 'Order replacement USB-C cable',
      durationMinutes: 5,
      completed: false,
    },
  ],
};
