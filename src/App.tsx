/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppState,
  ScreenMode,
  PriorityTask,
  SecondaryTask,
  ReminderSettings,
} from './types.ts';
import { INITIAL_STATE } from './data/defaultData.ts';
import { sounds } from './utils/audio.ts';
import { SetupScreen } from './components/SetupScreen.tsx';
import { LockedScreen } from './components/LockedScreen.tsx';
import { DayWonScreen } from './components/DayWonScreen.tsx';
import { ShelfModal } from './components/ShelfModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { MinimizedDock } from './components/MinimizedDock.tsx';
import { NotificationToast, ActiveNotification } from './components/NotificationToast.tsx';
import {
  sendPriorityReminderNotification,
  initServiceWorker,
  stopTabTitleAlert,
  startTabTitleAlert,
} from './utils/notifications.ts';

const STORAGE_KEY = 'onefocus_state_v2';
const LEGACY_STORAGE_KEY_V1 = 'onefocus_state_v1';
const LEGACY_STORAGE_KEY_ZENITH = 'zenith_focus_state_v3';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date/time matching user mockup: "October 21 - 4:00AM"
  const month = currentTime.toLocaleDateString('en-US', { month: 'long' });
  const day = currentTime.getDate();
  const timeStr = currentTime
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '');
  const formattedDateTime = `${month} ${day} - ${timeStr}`;

  // App state with smooth backward compatibility migration
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY_V1) ||
        localStorage.getItem(LEGACY_STORAGE_KEY_ZENITH);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy work/life format
        if (parsed.work && !parsed.priority) {
          const src = parsed[parsed.activeContext || 'work'] || parsed.work;
          return {
            ...INITIAL_STATE,
            ...parsed,
            priority: src.priority || INITIAL_STATE.priority,
            secondaryTasks: src.secondaryTasks || INITIAL_STATE.secondaryTasks,
            shelf: src.shelf || INITIAL_STATE.shelf,
            screenMode: src.screenMode || 'setup',
            reminders: { ...INITIAL_STATE.reminders, ...(parsed.reminders || {}) },
          };
        }
        return {
          ...INITIAL_STATE,
          ...parsed,
          reminders: { ...INITIAL_STATE.reminders, ...(parsed.reminders || {}) },
        };
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_STATE;
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<ActiveNotification | null>(null);
  const lastNotifiedMinuteRef = useRef<string | null>(null);
  const lastIntervalNotifiedAtRef = useRef<number>(Date.now());

  // Proactively register background Service Worker for native desktop push
  useEffect(() => {
    initServiceWorker().catch(() => {});
  }, []);

  // Keep sounds engine sync
  useEffect(() => {
    sounds.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  // Handlers for switching screen modes
  const setScreenMode = useCallback((mode: ScreenMode) => {
    setState((prev) => ({
      ...prev,
      screenMode: mode,
    }));
  }, []);

  // Toggle shelf drawer
  const toggleShelf = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shelfOpen: !prev.shelfOpen,
    }));
  }, []);

  const closeShelf = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shelfOpen: false,
    }));
  }, []);

  const openShelf = useCallback(() => {
    setState((prev) => ({
      ...prev,
      shelfOpen: true,
    }));
  }, []);

  // Update priority
  const updatePriority = useCallback((updates: Partial<PriorityTask>) => {
    setState((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        ...updates,
      },
    }));
  }, []);

  // Update secondary task
  const updateSecondaryTask = useCallback((id: string, updates: Partial<SecondaryTask>) => {
    setState((prev) => ({
      ...prev,
      secondaryTasks: prev.secondaryTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  // Shelf operations
  const addShelfItem = useCallback((item: { title: string; durationMinutes: number }) => {
    setState((prev) => ({
      ...prev,
      shelf: [
        ...prev.shelf,
        {
          id: `shelf-${Date.now()}`,
          title: item.title,
          durationMinutes: item.durationMinutes,
          completed: false,
        },
      ],
    }));
  }, []);

  const toggleShelfItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      shelf: prev.shelf.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  const deleteShelfItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      shelf: prev.shelf.filter((item) => item.id !== id),
    }));
  }, []);

  // Emergency Unlock -> Returns directly to Screen 1 ('setup')
  const handleEmergencyUnlock = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screenMode: 'setup',
      priority: {
        ...prev.priority,
        completed: false,
      },
    }));
  }, []);

  // New Day -> Reset to setup screen with empty inputs
  const handleResetToStartingScreen = useCallback(() => {
    sounds.playClick(0.8);
    setState((prev) => ({
      ...prev,
      screenMode: 'setup',
      priority: {
        ...prev.priority,
        title: '',
        completed: false,
      },
      secondaryTasks: prev.secondaryTasks.map((t) => ({
        ...t,
        title: '',
        completed: false,
      })),
      shelfOpen: false,
    }));
  }, []);

  // Minimize / Maximize window handlers (macOS genie/scale minimize to desktop dock)
  const handleMinimizeWindow = useCallback(() => {
    sounds.playMinimize();
    setIsMinimized(true);
  }, []);

  const handleMaximizeWindow = useCallback(() => {
    sounds.playRestore();
    stopTabTitleAlert();
    setIsMinimized(false);
  }, []);

  // Update reminder settings
  const updateReminderSettings = useCallback((updates: Partial<ReminderSettings>) => {
    setState((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        ...updates,
      },
    }));
  }, []);

  // Trigger reminder notification with dual delivery & Brave fallbacks
  const triggerReminderNotification = useCallback(
    (priority: PriorityTask) => {
      const hasTitle = priority.title && priority.title.trim().length > 0;
      const title = priority.completed
        ? 'OneFocus · Priority Done!'
        : 'OneFocus · Priority Reminder';

      const body = priority.completed
        ? `Great job! You've completed "${priority.title || 'your main priority'}". The day is won.`
        : hasTitle
        ? `Current Focus: "${priority.title}" (${priority.durationMinutes}m planned). Stay locked in!`
        : 'Reminder: Set your ONE crucial priority for today to win the day!';

      setActiveToast({
        id: `toast-${Date.now()}`,
        title,
        body,
        durationMinutes: priority.durationMinutes,
        type: priority.completed ? 'completed' : 'reminder',
      });

      if (isMinimized || (typeof document !== 'undefined' && (document.hidden || !document.hasFocus()))) {
        startTabTitleAlert(hasTitle ? priority.title : 'Check in on priority');
      }

      sendPriorityReminderNotification(priority, 'Focus', () => {
        setIsMinimized(false);
        stopTabTitleAlert();
      }).catch((err) => {
        console.warn('[OneFocus] Desktop push dispatch warning:', err);
      });
    },
    [isMinimized]
  );

  // Background check for scheduled reminder times & recurring intervals
  useEffect(() => {
    if (!state.reminders?.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentMinuteStr = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

      if (
        state.reminders.specificTimes.includes(currentMinuteStr) &&
        lastNotifiedMinuteRef.current !== currentMinuteStr
      ) {
        lastNotifiedMinuteRef.current = currentMinuteStr;
        triggerReminderNotification(state.priority);
      }

      if (state.reminders.intervalEnabled && state.reminders.intervalMinutes > 0) {
        const intervalMs = state.reminders.intervalMinutes * 60 * 1000;
        if (Date.now() - lastIntervalNotifiedAtRef.current >= intervalMs) {
          lastIntervalNotifiedAtRef.current = Date.now();
          triggerReminderNotification(state.priority);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.reminders, state.priority, triggerReminderNotification]);

  // Synchronize document title
  useEffect(() => {
    if (typeof document !== 'undefined' && document.title.startsWith('🔔')) {
      return;
    }
    if (isMinimized) {
      const taskTitle = state.priority.title.trim();
      document.title = taskTitle
        ? `● ${taskTitle.length > 25 ? taskTitle.slice(0, 25) + '…' : taskTitle} — OneFocus`
        : '● Focus — OneFocus';
    } else {
      document.title = 'OneFocus — The One Thing Protocol';
    }
  }, [isMinimized, state.priority.title]);

  // Undo priority completion
  const handleUndoPriority = useCallback(() => {
    sounds.playClick(0.9);
    updatePriority({ completed: false });
    setScreenMode('locked');
  }, [updatePriority, setScreenMode]);

  // Global Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (isMinimized) {
        if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          handleMaximizeWindow();
          return;
        }
      }

      // Cmd+, opens settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
        return;
      }

      // Cmd+M minimizes/restores window
      if ((e.metaKey || e.ctrlKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        if (isMinimized) {
          handleMaximizeWindow();
        } else {
          handleMinimizeWindow();
        }
        return;
      }

      // Cmd+Z to undo when on day won screen
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        if (state.screenMode === 'day_won') {
          e.preventDefault();
          handleUndoPriority();
          return;
        }
      }

      // Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (state.screenMode === 'setup') {
          sounds.playCommit();
          setScreenMode('locked');
        } else if (state.screenMode === 'locked') {
          handleMinimizeWindow();
        } else if (state.screenMode === 'day_won') {
          handleMinimizeWindow();
        }
      }

      // 's' opens/closes shelf when not actively typing in an input
      if (!isInput && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        sounds.playClick(1.0);
        toggleShelf();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMinimized,
    state.screenMode,
    setScreenMode,
    toggleShelf,
    handleUndoPriority,
    handleMaximizeWindow,
    handleMinimizeWindow,
  ]);

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-neutral-900 relative overflow-hidden select-none font-sans">
      {/* Main Window Viewport */}
      <div
        className={`w-full h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom ${
          isMinimized
            ? 'opacity-0 scale-[0.2] translate-y-[55vh] pointer-events-none'
            : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
        }`}
      >
        {/* Fixed Top Corner Anchors: "One Focus" (top-left) & Date/Time (top-right) */}
        <header className="w-full flex items-center justify-between px-8 sm:px-12 pt-8 pb-4 z-20">
          <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
            One Focus
          </span>
          <span className="text-sm sm:text-base font-medium text-neutral-500 tracking-tight font-tabular">
            {formattedDateTime}
          </span>
        </header>

        {/* Main Focus Area: Screen 1 (setup), Screen 2 (locked), or Screen 3 (day_won) */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          {state.screenMode === 'setup' && (
            <SetupScreen
              priority={state.priority}
              secondaryTasks={state.secondaryTasks}
              onUpdatePriority={updatePriority}
              onUpdateSecondaryTask={updateSecondaryTask}
              onCommit={() => setScreenMode('locked')}
              onOpenShelf={openShelf}
              onOpenSettings={() => setSettingsOpen(true)}
              shelfCount={state.shelf.length}
            />
          )}

          {state.screenMode === 'locked' && (
            <LockedScreen
              priority={state.priority}
              onCompletePriority={() => {
                updatePriority({ completed: true });
                setScreenMode('day_won');
              }}
              onEditPriority={() => {
                setScreenMode('setup');
              }}
              onMinimizeWindow={handleMinimizeWindow}
              onOpenShelf={openShelf}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          {state.screenMode === 'day_won' && (
            <DayWonScreen
              priority={state.priority}
              secondaryTasks={state.secondaryTasks}
              onUndoComplete={handleUndoPriority}
              onMinimizeWindow={handleMinimizeWindow}
              onUpdateSecondaryTask={updateSecondaryTask}
              onOpenShelf={openShelf}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Minimized Focus Dock (macOS desktop dock when minimized) */}
      {isMinimized && (
        <MinimizedDock
          priority={state.priority}
          screenMode={state.screenMode}
          onMaximize={handleMaximizeWindow}
          onToggleComplete={() => {
            sounds.playDayWon();
            const nextCompleted = !state.priority.completed;
            updatePriority({ completed: nextCompleted });
            if (nextCompleted) {
              setScreenMode('day_won');
            } else {
              setScreenMode('locked');
            }
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          onNewDay={handleResetToStartingScreen}
        />
      )}

      {/* Shelf Drawer Overlay (Matches screenshot 1) */}
      <ShelfModal
        isOpen={state.shelfOpen}
        onClose={closeShelf}
        items={state.shelf}
        onAddItem={addShelfItem}
        onToggleItem={toggleShelfItem}
        onDeleteItem={deleteShelfItem}
        formattedDateTime={formattedDateTime}
      />

      {/* Settings Modal (Includes New Day, Emergency Unlock, Reminders, Push Alerts, Brave Support) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={state.reminders}
        onUpdateSettings={updateReminderSettings}
        onNewDay={handleResetToStartingScreen}
        onEmergencyUnlock={handleEmergencyUnlock}
        onTriggerTestNotification={() => {
          setActiveToast({
            id: `test-${Date.now()}`,
            title: 'OneFocus · Desktop Notification Active',
            body: 'Your custom priority reminders are now linked to your desktop and on-screen alerts!',
            type: 'test',
          });
        }}
      />

      {/* Floating macOS Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onAction={() => {
          setIsMinimized(false);
          setActiveToast(null);
        }}
      />
    </div>
  );
}
