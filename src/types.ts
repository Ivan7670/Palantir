export type ScreenMode = 'setup' | 'locked' | 'day_won';

export type WorkLifeContext = 'work' | 'life';

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

export interface ContextState {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  shelf: ShelfItem[];
  screenMode: ScreenMode;
}

export interface AppState {
  activeContext: WorkLifeContext;
  work: ContextState;
  life: ContextState;
  shelfOpen: boolean;
  soundEnabled: boolean;
}
