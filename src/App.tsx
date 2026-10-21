/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { AppState, ScreenMode, WorkLifeContext, PriorityTask, SecondaryTask } from './types.ts';
import { INITIAL_STATE } from './data/defaultData.ts';
import { sounds } from './utils/audio.ts';
import { WorkLifeToggle } from './components/WorkLifeToggle.tsx';
import { SetupScreen } from './components/SetupScreen.tsx';
import { LockedScreen } from './components/LockedScreen.tsx';
import { DayWonScreen } from './components/DayWonScreen.tsx';
import { ShelfModal } from './components/ShelfModal.tsx';

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
          work: { ...INITIAL_STATE.work, ...parsed.work },
          life: { ...INITIAL_STATE.life, ...parsed.life },
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATE;
  });

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

  const [isPageClosed, setIsPageClosed] = useState(false);

  // Close webpage entirely (Requirement 1 & 3)
  const handleCloseWebpage = useCallback(() => {
    sounds.playCommit();
    try {
      window.close();
    } catch {
      // Ignore
    }
    setIsPageClosed(true);
  }, []);

  // Undo priority completion -> Returns to Screen 2 ('locked')
  const handleUndoPriority = useCallback(() => {
    sounds.playClick(0.9);
    updatePriority({ completed: false });
    setScreenMode('locked');
  }, [updatePriority, setScreenMode]);

  // Keyboard shortcut listener: Cmd+Enter, 's', Esc, 1/2/3 to switch screens, Cmd+Z to undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

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
          handleCloseWebpage();
        } else if (currentContextData.screenMode === 'day_won') {
          handleCloseWebpage();
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
  }, [currentContextData, setScreenMode, toggleShelf, updateSecondaryTask, handleUndoPriority]);

  if (isPageClosed) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0d1016] text-[#dfe2eb] select-none p-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-[#161a22] border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <span className="w-3 h-3 rounded-full bg-[#0a84ff] shadow-[0_0_16px_rgba(10,132,255,0.8)]" />
        </div>
        <h1 className="text-xl font-semibold text-white tracking-tight mb-2">
          Priority Committed
        </h1>
        <p className="text-sm text-[#8b91a0] max-w-sm leading-relaxed mb-8">
          Focus is set. Window closed — go about your day.
        </p>
        <button
          type="button"
          onClick={() => setIsPageClosed(false)}
          className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#8b91a0] hover:text-white transition-colors cursor-pointer"
        >
          Reopen OneFocus
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] relative overflow-hidden select-none">
      {/* Background subtle radial ambient glow for depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#0a84ff]/[0.025] rounded-full blur-[140px] pointer-events-none" />
      {currentContextData.screenMode === 'day_won' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#34d399]/[0.035] rounded-full blur-[160px] pointer-events-none transition-all duration-1000" />
      )}

      {/* Top Bar: Date & Time (Left), Work/Life Toggle (Center), New Day Button (Right) */}
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

        {/* Right: New Day Button (Requirement 3: Replaces Reset) */}
        <div className="flex justify-end min-w-[200px]">
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
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 pb-4">
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
            onCompletePriority={() => {
              updatePriority({ completed: true });
              setScreenMode('day_won');
            }}
            onCloseWebpage={handleCloseWebpage}
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
            onCloseWebpage={handleCloseWebpage}
            onUpdateSecondaryTask={updateSecondaryTask}
          />
        )}
      </main>

      {/* Shelf Modal (Screen 4: pure typographic slate overlay) */}
      <ShelfModal
        isOpen={state.shelfOpen}
        onClose={closeShelf}
        items={currentContextData.shelf}
        onAddItem={addShelfItem}
        onToggleItem={toggleShelfItem}
        onDeleteItem={deleteShelfItem}
      />
    </div>
  );
}
