import React, { useState } from 'react';
import { Check, RotateCcw, Settings } from 'lucide-react';
import { PriorityTask, ScreenMode } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface MinimizedDockProps {
  priority: PriorityTask;
  screenMode: ScreenMode;
  onMaximize: () => void;
  onToggleComplete: () => void;
  onOpenSettings: () => void;
  onNewDay: () => void;
}

export const MinimizedDock: React.FC<MinimizedDockProps> = ({
  priority,
  screenMode,
  onMaximize,
  onToggleComplete,
  onOpenSettings,
  onNewDay,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hasTitle = priority.title && priority.title.trim().length > 0;
  const isCompleted = priority.completed || screenMode === 'day_won';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end items-center pb-5 px-4 select-none animate-in fade-in duration-300">
      {/* Floating macOS Dock Shelf sitting on the desktop */}
      <div className="pointer-events-auto relative flex flex-col items-center">
        {/* Hover Tooltip */}
        <div
          className={`absolute -top-10 transition-all duration-200 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-900 text-xs font-semibold text-white shadow-xl ${
            hoveredItem ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
          }`}
        >
          {hoveredItem === 'app' && <span>OneFocus</span>}
          {hoveredItem === 'window' && (
            <span>
              {hasTitle ? `OneFocus — "${priority.title}"` : 'OneFocus — Window'} (Click to expand)
            </span>
          )}
          {hoveredItem === 'settings' && <span>Settings & Reminders</span>}
          {hoveredItem === 'new_day' && <span>Start New Day</span>}
        </div>

        {/* The Dock Container */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-700/60 backdrop-blur-2xl shadow-2xl transition-all">
          {/* Dock Item 1: App Icon */}
          <div
            onClick={() => {
              sounds.playRestore();
              onMaximize();
            }}
            onMouseEnter={() => setHoveredItem('app')}
            onMouseLeave={() => setHoveredItem(null)}
            className="flex flex-col items-center cursor-pointer group transition-transform duration-200 ease-out hover:-translate-y-2 hover:scale-105 active:scale-95"
            title="OneFocus"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-neutral-900 font-extrabold text-xl shadow-md border border-neutral-200">
              <span>1</span>
            </div>
            {/* Running indicator dot */}
            <div className="w-1 h-1 rounded-full bg-white mt-1 shadow-xs" />
          </div>

          {/* Dock Separator */}
          <div className="w-[1px] h-8 bg-neutral-700/60 mx-1" />

          {/* Dock Item 2: The Minimized Focus Tab */}
          <div
            onClick={() => {
              sounds.playRestore();
              onMaximize();
            }}
            onMouseEnter={() => setHoveredItem('window')}
            onMouseLeave={() => setHoveredItem(null)}
            className="group flex flex-col cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-2 hover:scale-[1.02] active:scale-95"
            title="Click to expand OneFocus window"
          >
            <div className="w-[280px] sm:w-[320px] h-[52px] rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 shadow-md flex flex-col justify-between p-2 relative overflow-hidden transition-all text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-neutral-700/60">
                <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                  OneFocus
                </span>
                <span className="text-[10px] font-bold font-tabular text-neutral-300">
                  {priority.durationMinutes}m
                </span>
              </div>

              {/* Content */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete();
                    }}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-500 hover:border-white'
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <span
                    className={`text-xs font-semibold truncate ${
                      isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                    }`}
                  >
                    {hasTitle ? priority.title : 'One crucial priority'}
                  </span>
                </div>

                <span className="text-[10px] text-neutral-300 font-bold shrink-0 group-hover:underline">
                  Expand ↗
                </span>
              </div>
            </div>

            <div className="w-1 h-1 rounded-full bg-white/70 mx-auto mt-1" />
          </div>

          {/* Dock Separator */}
          <div className="w-[1px] h-8 bg-neutral-700/60 mx-1" />

          {/* Dock Item 3: Settings */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onOpenSettings();
            }}
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-10 h-10 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            title="Settings (Cmd+,)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dock Item 4: New Day */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(0.9);
              onNewDay();
            }}
            onMouseEnter={() => setHoveredItem('new_day')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-10 h-10 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            title="Start New Day"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-[10px] text-neutral-400 mt-1.5 font-mono tracking-wide">
          Press Space or Esc to expand window · Cmd+M
        </div>
      </div>
    </div>
  );
};
