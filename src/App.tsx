/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ScreenMode, WorkLifeContext, PriorityTask, SecondaryTask } from './types.ts';
import { INITIAL_STATE } from './data/defaultData.ts';
import { sounds } from './utils/audio.ts';
import { WorkLifeToggle } from './components/WorkLifeToggle.tsx';
import { SetupScreen } from './components/SetupScreen.tsx';
import { LockedScreen } from './components/LockedScreen.tsx';
import { DayWonScreen } from './components/DayWonScreen.tsx';
import { ShelfModal } from './components/ShelfModal.tsx';

const STORAGE_KEY = 'zenith_focus_state_v2';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
          sounds.playDayWon();
          setScreenMode('day_won');
        } else if (currentContextData.screenMode === 'day_won') {
          sounds.playClick(1.2);
          if (currentContextData.secondaryTasks.length > 0) {
            updateSecondaryTask(currentContextData.secondaryTasks[0].id, {
              completed: !currentContextData.secondaryTasks[0].completed,
            });
          }
        }
      }

      // 's' opens/closes shelf when not typing
      if (!isInput && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        sounds.playClick(1.0);
        toggleShelf();
      }

      // Quick numbers 1, 2, 3 when not typing to jump between screens
      if (!isInput && !e.metaKey && !e.ctrlKey) {
        if (e.key === '1') {
          sounds.playClick(1.0);
          setScreenMode('setup');
        } else if (e.key === '2') {
          sounds.playClick(1.0);
          setScreenMode('locked');
        } else if (e.key === '3') {
          sounds.playClick(1.0);
          setScreenMode('day_won');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentContextData, setScreenMode, toggleShelf, updateSecondaryTask, handleUndoPriority]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#10141a] text-[#dfe2eb] relative overflow-hidden select-none">
      {/* Background subtle radial ambient glow for depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#0a84ff]/[0.025] rounded-full blur-[140px] pointer-events-none" />
      {currentContextData.screenMode === 'day_won' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#34d399]/[0.035] rounded-full blur-[160px] pointer-events-none transition-all duration-1000" />
      )}

      {/* Top Bar is removed: Empty top with generous breathing room and centered Work | Life toggle */}
      <div className="w-full flex justify-center pt-8 pb-4 z-20">
        <WorkLifeToggle activeContext={state.activeContext} onChange={setContext} />
      </div>

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
            onCompleteDay={() => {
              sounds.playDayWon();
            }}
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
