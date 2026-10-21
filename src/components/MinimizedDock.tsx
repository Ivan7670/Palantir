import React, { useState } from 'react';
import {
  Check,
  Clock,
  Bell,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PriorityTask, ScreenMode } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface MinimizedDockProps {
  priority: PriorityTask;
  screenMode: ScreenMode;
  contextName: string;
  onMaximize: () => void;
  onToggleComplete: () => void;
  onOpenSettings: () => void;
  onNewDay: () => void;
}

export const MinimizedDock: React.FC<MinimizedDockProps> = ({
  priority,
  screenMode,
  contextName,
  onMaximize,
  onToggleComplete,
  onOpenSettings,
  onNewDay,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hasTitle = priority.title && priority.title.trim().length > 0;
  const isCompleted = priority.completed || screenMode === 'day_won';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end items-center pb-4 px-4 select-none animate-in fade-in duration-300">
      {/* Floating macOS Dock Shelf sitting on the desktop */}
      <div className="pointer-events-auto relative flex flex-col items-center">
        {/* Hover Tooltip (macOS Dock Style) */}
        <div
          className={`absolute -top-11 transition-all duration-200 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#181d26]/95 border border-white/20 text-xs font-medium text-white shadow-xl backdrop-blur-xl ${
            hoveredItem ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
          }`}
        >
          {hoveredItem === 'app' && <span>OneFocus</span>}
          {hoveredItem === 'window' && (
            <span>
              {hasTitle ? `OneFocus — "${priority.title}"` : 'OneFocus — Window'} (Click to expand)
            </span>
          )}
          {hoveredItem === 'settings' && <span>Reminders & Notifications</span>}
          {hoveredItem === 'new_day' && <span>Start New Day</span>}
        </div>

        {/* The Dock Glass Container */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#141922]/85 hover:bg-[#161c26]/90 border border-white/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(10,132,255,0.12)] transition-all">
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1e40af] via-[#0284c7] to-[#0369a1] p-[1px] shadow-lg relative flex items-center justify-center overflow-hidden border border-white/25">
              {/* Glossy top-half reflection */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-white/20 pointer-events-none rounded-t-xl" />
              <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-[#0a84ff] to-[#0051a8] flex items-center justify-center text-white font-bold text-lg tracking-tighter">
                <span className="font-mono text-xl drop-shadow-md">1</span>
              </div>
            </div>
            {/* Running app indicator dot */}
            <div className="w-1 h-1 rounded-full bg-white/80 mt-1 shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
          </div>

          {/* Dock Separator */}
          <div className="w-[1px] h-8 bg-white/15 mx-1" />

          {/* Dock Item 2: The Minimized Window Tab (Sits in the desktop dock like on Mac) */}
          <div
            onClick={() => {
              sounds.playRestore();
              onMaximize();
            }}
            onMouseEnter={() => setHoveredItem('window')}
            onMouseLeave={() => setHoveredItem(null)}
            className="group flex flex-col cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-2.5 hover:scale-[1.02] active:scale-95"
            title="Click to expand OneFocus window"
          >
            <div className="w-[280px] sm:w-[320px] h-[52px] rounded-xl bg-[#181e28]/95 hover:bg-[#1e2533] border border-white/20 hover:border-white/35 backdrop-blur-2xl shadow-xl flex flex-col justify-between p-2 relative overflow-hidden transition-all">
              {/* Glass sheen highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Minimized Window Mini-Titlebar */}
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.07]">
                <div className="flex items-center gap-1.5">
                  {/* Mini Traffic Lights */}
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff5f56]/80" />
                    <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/80" />
                    <span className="w-2 h-2 rounded-full bg-[#27c93f]/80" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#8b91a0] uppercase tracking-wider ml-1">
                    OneFocus · {contextName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                  <span className="text-[10px] font-medium font-tabular text-[#8b91a0]">
                    {priority.durationMinutes}m
                  </span>
                </div>
              </div>

              {/* Minimized Window Preview Content */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Complete checkmark button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete();
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-[#122820] border-[#34d399]/60 text-[#34d399]'
                        : 'bg-white/[0.04] border-white/20 text-[#8b91a0] hover:border-[#34d399]/60 hover:text-[#34d399]'
                    }`}
                    title={isCompleted ? 'Mark incomplete' : 'Mark priority done'}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-mono">1</span>
                    )}
                  </button>

                  <span
                    className={`text-xs font-medium truncate ${
                      isCompleted ? 'line-through text-[#64748b]' : 'text-white'
                    }`}
                  >
                    {hasTitle ? priority.title : 'One crucial priority'}
                  </span>
                </div>

                <span className="text-[10px] text-[#0a84ff] font-medium shrink-0 group-hover:underline">
                  Expand ↗
                </span>
              </div>
            </div>

            {/* Window dot indicator */}
            <div className="w-1 h-1 rounded-full bg-white/70 mx-auto mt-1" />
          </div>

          {/* Dock Separator */}
          <div className="w-[1px] h-8 bg-white/15 mx-1" />

          {/* Dock Item 3: Settings */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onOpenSettings();
            }}
            onMouseEnter={() => setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center text-[#8b91a0] hover:text-white transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            title="Reminder Settings"
          >
            <Bell className="w-4 h-4" />
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
            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center text-[#8b91a0] hover:text-white transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            title="Start New Day"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-[10px] text-[#64748b]/80 mt-1 font-mono tracking-wide">
          Press Space or Esc to expand window
        </div>
      </div>
    </div>
  );
};
