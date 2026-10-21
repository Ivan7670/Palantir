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
  activeContext: 'work',
  shelfOpen: false,
  soundEnabled: true,
  reminders: INITIAL_REMINDERS,
  work: {
    screenMode: 'setup',
    priority: {
      id: 'work-p1',
      title: '',
      durationMinutes: 90,
      completed: false,
      completedTimeMinutes: 90,
    },
    secondaryTasks: [
      {
        id: 'work-s2',
        title: '',
        durationMinutes: 45,
        completed: false,
        optional: true,
      },
      {
        id: 'work-s3',
        title: '',
        durationMinutes: 15,
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
        title: 'Schedule 1:1 with Sarah',
        durationMinutes: 10,
        completed: false,
      },
      {
        id: 'shelf-4',
        title: 'Order replacement USB-C cable',
        durationMinutes: 5,
        completed: false,
      },
      {
        id: 'shelf-5',
        title: 'Review staging log alerts',
        durationMinutes: 10,
        completed: false,
      },
    ],
  },
  life: {
    screenMode: 'setup',
    priority: {
      id: 'life-p1',
      title: '',
      durationMinutes: 90,
      completed: false,
      completedTimeMinutes: 90,
    },
    secondaryTasks: [
      {
        id: 'life-s2',
        title: '',
        durationMinutes: 30,
        completed: false,
        optional: true,
      },
      {
        id: 'life-s3',
        title: '',
        durationMinutes: 20,
        completed: false,
        optional: true,
      },
    ],
    shelf: [
      {
        id: 'life-sh1',
        title: 'Call vet to confirm vaccination appointment',
        durationMinutes: 5,
        completed: false,
      },
      {
        id: 'life-sh2',
        title: 'Refill water filter cartridges',
        durationMinutes: 5,
        completed: false,
      },
      {
        id: 'life-sh3',
        title: 'Drop off dry cleaning',
        durationMinutes: 15,
        completed: false,
      },
    ],
  },
};
