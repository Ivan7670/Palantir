import React, { useState } from 'react';
import {
  Check,
  Play,
  Archive,
  Command,
  CornerDownLeft,
  Pause,
  Undo2,
  RotateCcw,
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
  onCompleteDay: () => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
}

export const DayWonScreen: React.FC<DayWonScreenProps> = ({
  priority,
  secondaryTasks,
  onOpenShelf,
  onEmergencyUnlock,
  onUndoComplete,
  onCompleteDay,
  onUpdateSecondaryTask,
}) => {
  const [activeRunningTaskId, setActiveRunningTaskId] = useState<string | null>(null);
  const [dayFinished, setDayFinished] = useState(false);

  const toggleTaskRunning = (taskId: string) => {
    sounds.playClick(activeRunningTaskId === taskId ? 0.9 : 1.2);
    if (activeRunningTaskId === taskId) {
      setActiveRunningTaskId(null);
    } else {
      setActiveRunningTaskId(taskId);
    }
  };

  const handleStartTask2 = () => {
    if (secondaryTasks.length > 0) {
      toggleTaskRunning(secondaryTasks[0].id);
    }
  };

  const handleToggleSecondaryComplete = (taskId: string, currentCompleted: boolean) => {
    sounds.playClick(currentCompleted ? 0.9 : 1.4);
    onUpdateSecondaryTask(taskId, { completed: !currentCompleted });
    if (activeRunningTaskId === taskId) {
      setActiveRunningTaskId(null);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 max-w-4xl mx-auto">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Subtitle / Kicker */}
        <div className="flex flex-col items-center gap-1.5 mb-7 text-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-sm font-medium text-[#dfe2eb] tracking-tight">
              The priority is complete. The day is already a win.
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.22em] text-[#8b91a0] uppercase">
            EVERYTHING BELOW IS STRICTLY OPTIONAL.
          </span>
        </div>

        {/* Hero Completed Card with Undo on Hover */}
        <div className="group w-full max-w-[620px] bg-[#181c24]/90 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-8 shadow-[0_24px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-center">
          {/* Mint / Emerald sheen on top rim */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-[#34d399]/50 to-transparent" />

          {/* Top-Right Undo Button (Appears on Hover) */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={onUndoComplete}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#8b91a0] hover:text-white transition-all shadow-md cursor-pointer"
              title="Undo completion and return to locked priority"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>

          {/* Number 1 Badge with Checkmark + Click to Undo */}
          <button
            type="button"
            onClick={onUndoComplete}
            title="Click to undo marking as done"
            className="group/badge w-10 h-10 rounded-full bg-[#122820] hover:bg-[#252217] border border-[#34d399]/40 hover:border-[#f59e0b]/50 flex items-center justify-center text-[#34d399] hover:text-[#f59e0b] font-semibold text-base mx-auto mb-5 shadow-inner transition-all duration-200 cursor-pointer"
          >
            <span className="group-hover/badge:hidden flex items-center gap-0.5">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs">1</span>
            </span>
            <Undo2 className="w-4 h-4 hidden group-hover/badge:inline" />
          </button>

          {/* Title */}
          <h2 className="text-2xl md:text-[28px] font-semibold text-[#f0f6fc] text-center leading-snug tracking-tight max-w-lg mx-auto mb-5">
            {priority.title || 'One crucial priority'}
          </h2>

          {/* Completed Badge with Inline Undo Option */}
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122820] border border-[#34d399]/30 text-[#34d399] text-xs font-tabular font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>Completed in {priority.completedTimeMinutes || priority.durationMinutes}m</span>
            </div>

            <button
              type="button"
              onClick={onUndoComplete}
              className="opacity-0 group-hover:opacity-80 hover:!opacity-100 text-[11px] text-[#8b91a0] hover:text-white transition-all underline underline-offset-2 ml-1 cursor-pointer"
              title="Undo completion"
            >
              Undo
            </button>
          </div>
        </div>

        {/* Optional Queue Cards */}
        <div className="w-full max-w-[620px] mt-6 flex flex-col gap-2.5">
          {secondaryTasks.map((task, idx) => {
            const isRunning = activeRunningTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-white/[0.02] border-white/[0.03] opacity-60'
                    : isRunning
                    ? 'bg-[#1b2535] border-[#3b82f6]/40 shadow-[0_0_16px_rgba(59,130,246,0.15)]'
                    : 'bg-[#171b23]/80 border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1a1f29]'
                }`}
              >
                {/* Left: Index + Title + Optional label */}
                <div className="flex items-center gap-3 min-w-0 mr-3">
                  <span className="w-6 h-6 rounded-full bg-white/[0.04] text-[#8b91a0] font-tabular text-xs flex items-center justify-center shrink-0">
                    {idx + 2}
                  </span>

                  <span
                    className={`text-sm tracking-tight truncate ${
                      task.completed ? 'line-through text-[#64748b]' : 'text-[#dfe2eb]'
                    }`}
                  >
                    {task.title || 'optional tasks'}
                  </span>

                  <span className="text-xs text-[#64748b] shrink-0 font-normal">· optional</span>
                </div>

                {/* Right: Allocated badge + Play/Pause button / Checkmark toggle */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-tabular text-xs text-[#8b91a0] bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-md">
                    {task.durationMinutes}m allocated
                  </span>

                  {task.completed ? (
                    <button
                      type="button"
                      onClick={() => handleToggleSecondaryComplete(task.id, true)}
                      className="w-7 h-7 rounded-full bg-[#122820] hover:bg-[#252217] text-[#34d399] hover:text-[#f59e0b] border border-transparent hover:border-[#f59e0b]/40 flex items-center justify-center transition-all cursor-pointer group/secDone"
                      title="Click to undo secondary task completion"
                    >
                      <Check className="w-3.5 h-3.5 group-hover/secDone:hidden" />
                      <Undo2 className="w-3.5 h-3.5 hidden group-hover/secDone:inline" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleTaskRunning(task.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isRunning
                          ? 'bg-[#3b82f6] text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#8b91a0] hover:text-white'
                      }`}
                      title={isRunning ? 'Pause task' : 'Start optional task'}
                    >
                      {isRunning ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                  )}

                  {!task.completed && isRunning && (
                    <button
                      type="button"
                      onClick={() => handleToggleSecondaryComplete(task.id, false)}
                      className="text-[11px] text-[#34d399] hover:underline px-1 cursor-pointer"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-6 border-t border-transparent">
        {/* Left: Emergency Unlock (5s in Day Won) */}
        <EmergencyUnlockButton holdSeconds={5} onUnlock={onEmergencyUnlock} />

        {/* Center: Shelf (<15m) Button with active dot */}
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

        {/* Right: Complete Day + Start Task #2 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              setDayFinished(true);
              onCompleteDay();
            }}
            className="text-xs text-[#8b91a0] hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            {dayFinished ? 'Day Finished ✓' : 'Complete Day'}
          </button>

          <button
            type="button"
            onClick={handleStartTask2}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
          >
            <span>Start Task #2 (Optional)</span>
            <span className="flex items-center opacity-70 text-[10px] font-mono">
              <Command className="w-3 h-3" />
              <CornerDownLeft className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
