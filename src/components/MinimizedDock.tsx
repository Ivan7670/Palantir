import React from 'react';
import {
  Check,
  Maximize2,
  Clock,
  Bell,
  Settings,
  Sparkles,
  RotateCcw,
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
  const hasTitle = priority.title && priority.title.trim().length > 0;
  const isCompleted = priority.completed || screenMode === 'day_won';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end items-center pb-6 px-4 animate-in fade-in duration-300">
      {/* Ambient background hint to indicate minimized state */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            sounds.playClick(1.0);
            onMaximize();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161a22]/80 hover:bg-[#1f2532] border border-white/10 text-xs text-[#8b91a0] hover:text-white backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          title="Restore full window (Space or Esc)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand Window</span>
        </button>
      </div>

      {/* Floating Minimized Focus Dock Pill */}
      <div
        onClick={(e) => {
          // If clicking empty area of the pill, maximize
          const target = e.target as HTMLElement;
          if (!target.closest('button')) {
            sounds.playClick(1.0);
            onMaximize();
          }
        }}
        className="pointer-events-auto flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-[#141820]/95 hover:bg-[#181d26] border border-white/15 hover:border-white/25 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_24px_rgba(10,132,255,0.15)] transition-all duration-200 select-none cursor-pointer group max-w-xl w-full sm:w-auto"
      >
        {/* Status Indicator & Mark Done Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            isCompleted
              ? 'bg-[#122820] border-[#34d399]/60 text-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.3)]'
              : 'bg-[#12161f] border-white/20 text-[#8b91a0] hover:border-[#34d399]/50 hover:text-[#34d399]'
          }`}
          title={isCompleted ? 'Mark priority incomplete' : 'Click to mark priority done'}
        >
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <span className="flex items-center justify-center font-mono text-[11px]">1</span>
          )}
        </button>

        {/* Priority Title & Context Badge */}
        <div className="flex flex-col min-w-0 max-w-[260px] sm:max-w-[340px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a84ff] animate-pulse" />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8b91a0]">
              {isCompleted ? 'Day Won' : 'Committed Priority'} · {contextName}
            </span>
          </div>

          <span
            className={`text-xs font-medium truncate tracking-tight ${
              isCompleted ? 'line-through text-[#64748b]' : 'text-white'
            }`}
            title={priority.title || 'One crucial priority'}
          >
            {hasTitle ? priority.title : 'One crucial priority'}
          </span>
        </div>

        {/* Planned Time Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-tabular text-[#8b91a0] shrink-0">
          <Clock className="w-3 h-3 text-[#64748b]" />
          <span>{priority.durationMinutes}m</span>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-4 bg-white/10 shrink-0" />

        {/* Quick Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Reminders / Settings Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onOpenSettings();
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[#8b91a0] hover:text-white transition-colors cursor-pointer"
            title="Reminder Settings"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Restore / Maximize Window Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.1);
              onMaximize();
            }}
            className="w-7 h-7 rounded-lg bg-[#0a84ff]/20 hover:bg-[#0a84ff]/30 border border-[#0a84ff]/40 flex items-center justify-center text-[#93c5fd] hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Maximize window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helpful keyboard shortcut caption */}
      <span className="text-[10px] text-[#64748b]/80 mt-2 font-mono">
        Click dock or press Space to restore
      </span>
    </div>
  );
};
