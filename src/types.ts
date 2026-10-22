export type ScreenMode = 'setup' | 'locked' | 'day_won';

export interface PriorityTask {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  completedTimeMinutes?: number;
}

export interface SecondaryTask {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  optional: boolean;
}

export interface ShelfItem {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopPushEnabled: boolean;
  specificTimes: string[]; // ["09:00", "12:00", "15:00", "18:00"] (24h format HH:mm)
  intervalEnabled: boolean;
  intervalMinutes: number; // 30, 45, 60, etc.
}

export interface AppState {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  shelf: ShelfItem[];
  screenMode: ScreenMode;
  shelfOpen: boolean;
  soundEnabled: boolean;
  reminders: ReminderSettings;
}
