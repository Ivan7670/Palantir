import React from 'react';
import {
  Check,
  Archive,
  Command,
  CornerDownLeft,
  Clock,
  Undo2,
} from 'lucide-react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { EmergencyUnlockButton } from './EmergencyUnlockButton.tsx';

interface DayWonScreenProps {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onOpenShelf: () => void;
  onEmergencyUnlock: () => void;
  onUndoComplete: () => void;
  onCloseWebpage: () => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
}

export const DayWonScreen: React.FC<DayWonScreenProps> = ({
  priority,
  secondaryTasks,
  onOpenShelf,
  onEmergencyUnlock,
  onUndoComplete,
  onCloseWebpage,
  onUpdateSecondaryTask,
}) => {
  const handleToggleSecondaryComplete = (taskId: string, currentCompleted: boolean) => {
    sounds.playClick(currentCompleted ? 0.9 : 1.4);
    onUpdateSecondaryTask(taskId, { completed: !currentCompleted });
  };

  const handleGoodWorkClick = () => {
    sounds.playCommit();
    onCloseWebpage();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 max-w-4xl mx-auto">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Subtitle / Kicker: Requirement 3: "remove everything below is strictly optional" */}
        <div className="flex items-center gap-2 mb-7 text-center">
          <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-sm font-medium text-[#dfe2eb] tracking-tight">
            The priority is complete. The day is already a win.
          </span>
        </div>

        {/* Hero Completed Card: Requirement 4: entire box is clickable to toggle/undo */}
        <div
          onClick={onUndoComplete}
          className="group w-full max-w-[620px] bg-[#181c24]/90 hover:bg-[#1a1f29] border border-[#34d399]/40 hover:border-[#34d399]/60 rounded-2xl p-8 shadow-[0_24px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_28px_56px_rgba(52,211,153,0.18)] backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-center cursor-pointer select-none"
        >
          {/* Mint / Emerald sheen on top rim */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-[#34d399]/60 to-transparent" />

          {/* Top-Right Undo Tooltip / Button on hover */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-[#8b91a0] hover:text-white transition-all shadow-md">
              <Undo2 className="w-3.5 h-3.5" />
              <span>Click box to undo</span>
            </span>
          </div>

          {/* Number 1 Badge with Checkmark */}
          <div className="w-10 h-10 rounded-full bg-[#122820] border border-[#34d399]/40 flex items-center justify-center text-[#34d399] font-semibold text-base mx-auto mb-5 shadow-inner">
            <span className="flex items-center gap-0.5">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs">1</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-[28px] font-semibold text-[#f0f6fc] text-center leading-snug tracking-tight max-w-lg mx-auto mb-5">
            {priority.title || 'One crucial priority'}
          </h2>

          {/* Planned Duration Badge (Requirement 3: just lists planned time e.g. 90m, not 'completed in') */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122820] border border-[#34d399]/30 text-[#34d399] text-xs font-tabular font-medium shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{priority.durationMinutes}m</span>
          </div>
        </div>

        {/* Optional Queue Cards: Only shown if user entered non-empty tasks (Requirement 4) */}
        {(() => {
          const visibleSecondaryTasks = secondaryTasks.filter(
            (t) => t.title && t.title.trim().length > 0
          );
          if (visibleSecondaryTasks.length === 0) return null;

          return (
            <div className="w-full max-w-[620px] mt-6 flex flex-col gap-2.5">
              {visibleSecondaryTasks.map((task, idx) => {
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleSecondaryComplete(task.id, task.completed)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                      task.completed
                        ? 'bg-[#15231c]/60 border-[#34d399]/30 opacity-75'
                        : 'bg-[#171b23]/80 hover:bg-[#1a1f29] border-white/[0.06] hover:border-white/[0.14]'
                    }`}
                  >
                    {/* Left: Index + Checkmark / Task title */}
                    <div className="flex items-center gap-3 min-w-0 mr-3">
                      <span
                        className={`w-6 h-6 rounded-full font-tabular text-xs flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-[#122820] text-[#34d399] border border-[#34d399]/40'
                            : 'bg-white/[0.04] text-[#8b91a0]'
                        }`}
                      >
                        {task.completed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 2}
                      </span>

                      <span
                        className={`text-sm tracking-tight truncate transition-colors ${
                          task.completed ? 'line-through text-[#64748b]' : 'text-[#dfe2eb]'
                        }`}
                      >
                        {task.title}
                      </span>

                      <span className="text-xs text-[#64748b] shrink-0 font-normal">· Optional</span>
                    </div>

                    {/* Right: Just the planned duration */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-tabular text-xs text-[#8b91a0] bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-md">
                        {task.durationMinutes}m
                      </span>

                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          task.completed
                            ? 'bg-[#122820] border-[#34d399]/40 text-[#34d399]'
                            : 'border-white/10 text-transparent hover:border-white/20'
                        }`}
                        title={task.completed ? 'Marked as done' : 'Click card to mark done'}
                      >
                        <Check className={`w-3.5 h-3.5 ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Bottom Action Bar: Requirement 3: Emergency unlock and shelf appear here; button says "Good work" and closes page */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-6 border-t border-transparent">
        {/* Left: Emergency Unlock */}
        <EmergencyUnlockButton holdSeconds={5} onUnlock={onEmergencyUnlock} />

        {/* Center: Shelf Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(1.0);
            onOpenShelf();
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161a22] hover:bg-[#1f2532] border border-white/[0.08] text-xs font-medium text-[#dfe2eb] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
          <Archive className="w-3.5 h-3.5 text-[#8b91a0]" />
          <span>Shelf (&lt;15m)</span>
        </button>

        {/* Right: "Good work" button that closes the webpage (no complete day button) */}
        <button
          type="button"
          onClick={handleGoodWorkClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
        >
          <span>Good work</span>
          <span className="flex items-center opacity-70 text-[10px] font-mono">
            <Command className="w-3 h-3" />
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </button>
      </div>
    </div>
  );
};
