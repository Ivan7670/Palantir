/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, RotateCcw, Bell, Minus } from 'lucide-react';
import {
  AppState,
  ScreenMode,
  WorkLifeContext,
  PriorityTask,
  SecondaryTask,
  ReminderSettings,
} from './types.ts';
import { INITIAL_STATE } from './data/defaultData.ts';
import { sounds } from './utils/audio.ts';
import { WorkLifeToggle } from './components/WorkLifeToggle.tsx';
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
} from './utils/notifications.ts';

const STORAGE_KEY = 'onefocus_state_v1';
const LEGACY_STORAGE_KEY = 'zenith_focus_state_v3';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          reminders: { ...INITIAL_STATE.reminders, ...(parsed.reminders || {}) },
          work: { ...INITIAL_STATE.work, ...parsed.work },
          life: { ...INITIAL_STATE.life, ...parsed.life },
        };
      }
    } catch {
      // Fallback
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
      // Ignore storage errors
    }
  }, [state]);

  const currentContextData = state[state.activeContext];

  // Handlers for switching contexts
  const setContext = useCallback((context: WorkLifeContext) => {
    setState((prev) => ({
      ...prev,
      activeContext: context,
    }));
  }, []);

  // Handlers for switching screen modes
  const setScreenMode = useCallback(
    (mode: ScreenMode) => {
      setState((prev) => ({
        ...prev,
        [prev.activeContext]: {
          ...prev[prev.activeContext],
          screenMode: mode,
        },
      }));
    },
    []
  );

  // Toggle shelf modal
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

  // Update current priority
  const updatePriority = useCallback((updates: Partial<PriorityTask>) => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        priority: {
          ...prev[prev.activeContext].priority,
          ...updates,
        },
      },
    }));
  }, []);

  // Update secondary task
  const updateSecondaryTask = useCallback((id: string, updates: Partial<SecondaryTask>) => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        secondaryTasks: prev[prev.activeContext].secondaryTasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    }));
  }, []);

  // Shelf operations
  const addShelfItem = useCallback((item: { title: string; durationMinutes: number }) => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        shelf: [
          ...prev[prev.activeContext].shelf,
          {
            id: `shelf-${Date.now()}`,
            title: item.title,
            durationMinutes: item.durationMinutes,
            completed: false,
          },
        ],
      },
    }));
  }, []);

  const toggleShelfItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        shelf: prev[prev.activeContext].shelf.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ),
      },
    }));
  }, []);

  const deleteShelfItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        shelf: prev[prev.activeContext].shelf.filter((item) => item.id !== id),
      },
    }));
  }, []);

  // Emergency Unlock -> Returns to Screen 1 ('setup')
  const handleEmergencyUnlock = useCallback(() => {
    setState((prev) => ({
      ...prev,
      [prev.activeContext]: {
        ...prev[prev.activeContext],
        screenMode: 'setup',
        priority: {
          ...prev[prev.activeContext].priority,
          completed: false,
        },
      },
    }));
  }, []);

  // Reset back to starting screen (setup) with empty inputs
  const handleResetToStartingScreen = useCallback(() => {
    sounds.playClick(0.8);
    setState((prev) => ({
      ...prev,
      work: {
        ...prev.work,
        screenMode: 'setup',
        priority: {
          ...prev.work.priority,
          title: '',
          completed: false,
        },
        secondaryTasks: prev.work.secondaryTasks.map((t) => ({
          ...t,
          title: '',
          completed: false,
        })),
      },
      life: {
        ...prev.life,
        screenMode: 'setup',
        priority: {
          ...prev.life.priority,
          title: '',
          completed: false,
        },
        secondaryTasks: prev.life.secondaryTasks.map((t) => ({
          ...t,
          title: '',
          completed: false,
        })),
      },
      shelfOpen: false,
    }));
  }, []);

  // Minimize / Maximize window handlers (User Request 1: minimize for web app usage)
  const handleMinimizeWindow = useCallback(() => {
    sounds.playCommit();
    setIsMinimized(true);
  }, []);

  const handleMaximizeWindow = useCallback(() => {
    sounds.playClick(1.0);
    setIsMinimized(false);
  }, []);

  // Update reminder settings (User Request 2 & 3)
  const updateReminderSettings = useCallback((updates: Partial<ReminderSettings>) => {
    setState((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        ...updates,
      },
    }));
  }, []);

  // Trigger reminder notification with dual delivery:
  // 1. In-app macOS Sequoia floating banner (guaranteed visual delivery even if OS Do Not Disturb is ON)
  // 2. Native desktop push via Service Worker / Web Notification API
  const triggerReminderNotification = useCallback(
    (priority: PriorityTask, contextName: string) => {
      const hasTitle = priority.title && priority.title.trim().length > 0;
      const title = priority.completed
        ? `OneFocus · Priority Done! (${contextName.toUpperCase()})`
        : `OneFocus · Priority Reminder (${contextName.toUpperCase()})`;

      const body = priority.completed
        ? `Great job! You've completed "${priority.title || 'your main priority'}". The day is won.`
        : hasTitle
        ? `Current Focus: "${priority.title}" (${priority.durationMinutes}m planned). Stay locked in!`
        : 'Reminder: Set your ONE crucial priority for today to win the day!';

      // 1. Show floating on-screen banner
      setActiveToast({
        id: `toast-${Date.now()}`,
        title,
        body,
        contextName,
        durationMinutes: priority.durationMinutes,
        type: priority.completed ? 'completed' : 'reminder',
      });

      // 2. Dispatch native OS desktop push
      sendPriorityReminderNotification(priority, contextName, () => {
        setIsMinimized(false);
      }).catch((err) => {
        console.warn('[OneFocus] Desktop push dispatch warning:', err);
      });
    },
    []
  );

  // Background check for scheduled reminder times & recurring intervals (User Request 2 & 3)
  useEffect(() => {
    if (!state.reminders?.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentMinuteStr = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

      // 1. Check Specific Times
      if (
        state.reminders.specificTimes.includes(currentMinuteStr) &&
        lastNotifiedMinuteRef.current !== currentMinuteStr
      ) {
        lastNotifiedMinuteRef.current = currentMinuteStr;
        triggerReminderNotification(currentContextData.priority, state.activeContext);
      }

      // 2. Check Recurring Interval
      if (state.reminders.intervalEnabled && state.reminders.intervalMinutes > 0) {
        const intervalMs = state.reminders.intervalMinutes * 60 * 1000;
        if (Date.now() - lastIntervalNotifiedAtRef.current >= intervalMs) {
          lastIntervalNotifiedAtRef.current = Date.now();
          triggerReminderNotification(currentContextData.priority, state.activeContext);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.reminders,
    currentContextData.priority,
    state.activeContext,
    triggerReminderNotification,
  ]);

  // Synchronize dynamic document title when minimized vs full window
  useEffect(() => {
    if (isMinimized) {
      const taskTitle = currentContextData.priority.title.trim();
      document.title = taskTitle
        ? `● ${taskTitle.length > 25 ? taskTitle.slice(0, 25) + '…' : taskTitle} — OneFocus`
        : '● Focus — OneFocus';
    } else {
      document.title = 'OneFocus — The One Thing Protocol';
    }
  }, [isMinimized, currentContextData.priority.title]);

  // Undo priority completion -> Returns to Screen 2 ('locked')
  const handleUndoPriority = useCallback(() => {
    sounds.playClick(0.9);
    updatePriority({ completed: false });
    setScreenMode('locked');
  }, [updatePriority, setScreenMode]);

  // Keyboard shortcut listener: Space/Esc to maximize if minimized, Cmd+Enter, 's', 1/2, Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      // If minimized, Space or Esc restores window
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

      // Cmd+Z or Ctrl+Z to undo when on day won screen
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        if (currentContextData.screenMode === 'day_won') {
          e.preventDefault();
          handleUndoPriority();
          return;
        }
      }

      // Cmd+Enter or Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentContextData.screenMode === 'setup') {
          sounds.playCommit();
          setScreenMode('locked');
        } else if (currentContextData.screenMode === 'locked') {
          handleMinimizeWindow();
        } else if (currentContextData.screenMode === 'day_won') {
          handleMinimizeWindow();
        }
      }

      // 's' opens/closes shelf when not typing
      if (!isInput && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        sounds.playClick(1.0);
        toggleShelf();
      }

      // Quick numbers 1, 2 when not typing to navigate setup/locked
      if (!isInput && !e.metaKey && !e.ctrlKey) {
        if (e.key === '1') {
          sounds.playClick(1.0);
          setScreenMode('setup');
        } else if (e.key === '2') {
          sounds.playClick(1.0);
          setScreenMode('locked');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMinimized,
    currentContextData,
    setScreenMode,
    toggleShelf,
    updateSecondaryTask,
    handleUndoPriority,
    handleMaximizeWindow,
    handleMinimizeWindow,
  ]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] relative overflow-hidden select-none">
      {/* Background subtle radial ambient glow for depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#0a84ff]/[0.025] rounded-full blur-[140px] pointer-events-none" />
      {currentContextData.screenMode === 'day_won' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#34d399]/[0.035] rounded-full blur-[160px] pointer-events-none transition-all duration-1000" />
      )}

      {/* Top Bar: Date & Time (Left), Work/Life Toggle (Center), Actions & New Day (Right) */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-5 pb-2 flex items-center justify-between z-20 select-none">
        {/* Left: Live Date & Time */}
        <div className="flex items-center gap-2 text-xs text-[#8b91a0] min-w-[200px]">
          <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
          <span className="tracking-tight text-[#8b91a0] font-medium">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-[#64748b]/40">·</span>
          <span className="font-tabular text-[#dfe2eb] font-medium">
            {currentTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>

        {/* Center: Work | Life Toggle */}
        <div className="flex justify-center">
          <WorkLifeToggle activeContext={state.activeContext} onChange={setContext} />
        </div>

        {/* Right: Settings, Minimize, and New Day Buttons */}
        <div className="flex items-center justify-end gap-2 min-w-[200px]">
          {/* Settings / Reminders Icon Button (User Request 2 & 3) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              setSettingsOpen(true);
            }}
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-[#8b91a0] hover:text-[#dfe2eb] transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Reminders & Desktop Push Notifications (Cmd+,)"
          >
            <Bell className="w-3.5 h-3.5" />
            {state.reminders?.enabled && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
          </button>

          {/* Minimize Window Button (User Request 1) */}
          <button
            type="button"
            onClick={handleMinimizeWindow}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-[#8b91a0] hover:text-[#dfe2eb] transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Minimize to floating focus dock"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* New Day Button */}
          <button
            type="button"
            onClick={handleResetToStartingScreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-xs font-medium text-[#8b91a0] hover:text-[#dfe2eb] transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Start a new day with fresh inputs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Day</span>
          </button>
        </div>
      </header>

      {/* Main View Area (Renders Screen 1, 2, or 3 based on screenMode) */}
      <main
        className={`flex-1 flex flex-col overflow-hidden relative z-10 pb-4 transition-all duration-300 ${
          isMinimized ? 'opacity-20 scale-95 pointer-events-none blur-sm' : 'opacity-100 scale-100'
        }`}
      >
        {currentContextData.screenMode === 'setup' && (
          <SetupScreen
            context={state.activeContext}
            priority={currentContextData.priority}
            secondaryTasks={currentContextData.secondaryTasks}
            onUpdatePriority={updatePriority}
            onUpdateSecondaryTask={updateSecondaryTask}
            onCommit={() => setScreenMode('locked')}
            onOpenShelf={openShelf}
            onEmergencyUnlock={handleEmergencyUnlock}
            onAddShelfItem={addShelfItem}
            shelfCount={currentContextData.shelf.length}
          />
        )}

        {currentContextData.screenMode === 'locked' && (
          <LockedScreen
            priority={currentContextData.priority}
            secondaryTasks={currentContextData.secondaryTasks}
            onUpdatePriority={updatePriority}
            onEditPriority={() => {
              setScreenMode('setup');
            }}
            onCompletePriority={() => {
              updatePriority({ completed: true });
              setScreenMode('day_won');
            }}
            onMinimizeWindow={handleMinimizeWindow}
            onOpenShelf={openShelf}
            onEmergencyUnlock={handleEmergencyUnlock}
          />
        )}

        {currentContextData.screenMode === 'day_won' && (
          <DayWonScreen
            priority={currentContextData.priority}
            secondaryTasks={currentContextData.secondaryTasks}
            onOpenShelf={openShelf}
            onEmergencyUnlock={handleEmergencyUnlock}
            onUndoComplete={handleUndoPriority}
            onMinimizeWindow={handleMinimizeWindow}
            onUpdateSecondaryTask={updateSecondaryTask}
          />
        )}
      </main>

      {/* Minimized Focus Dock (User Request 1: Floating dock for web app usage) */}
      {isMinimized && (
        <MinimizedDock
          priority={currentContextData.priority}
          screenMode={currentContextData.screenMode}
          contextName={state.activeContext}
          onMaximize={handleMaximizeWindow}
          onToggleComplete={() => {
            sounds.playDayWon();
            const nextCompleted = !currentContextData.priority.completed;
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

      {/* Shelf Modal (Screen 4: pure typographic slate overlay) */}
      <ShelfModal
        isOpen={state.shelfOpen}
        onClose={closeShelf}
        items={currentContextData.shelf}
        onAddItem={addShelfItem}
        onToggleItem={toggleShelfItem}
        onDeleteItem={deleteShelfItem}
      />

      {/* Settings Modal (User Requests 2 & 3: Custom reminder times & desktop push notifications) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={state.reminders}
        onUpdateSettings={updateReminderSettings}
        onTriggerTestNotification={() => {
          setActiveToast({
            id: `test-${Date.now()}`,
            title: 'OneFocus · Desktop Notification Active',
            body: 'Your custom priority reminders are now linked to your desktop and on-screen alerts!',
            type: 'test',
          });
        }}
      />

      {/* Floating macOS Sequoia Notification Toast */}
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
