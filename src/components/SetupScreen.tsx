import React, { useState } from 'react';
import { Archive, CornerDownLeft, Command, Check, Clock } from 'lucide-react';
import { PriorityTask, SecondaryTask, WorkLifeContext } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { EmergencyUnlockButton } from './EmergencyUnlockButton.tsx';
import { CustomDurationModal } from './CustomDurationModal.tsx';

interface SetupScreenProps {
  context: WorkLifeContext;
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onUpdatePriority: (updates: Partial<PriorityTask>) => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
  onCommit: () => void;
  onOpenShelf: () => void;
  onEmergencyUnlock: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  context,
  priority,
  secondaryTasks,
  onUpdatePriority,
  onUpdateSecondaryTask,
  onCommit,
  onOpenShelf,
  onEmergencyUnlock,
}) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customTarget, setCustomTarget] = useState<'priority' | string>('priority');
  const [editingSecondaryId, setEditingSecondaryId] = useState<string | null>(null);
  const [selectingTimeForTaskId, setSelectingTimeForTaskId] = useState<string | null>(null);

  const durationOptions = [
    { label: '5m', minutes: 5 },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
  ];

  const secondaryDurationPresets = [15, 30, 45, 60];

  const isPresetSelected = durationOptions.some((opt) => opt.minutes === priority.durationMinutes);

  const currentCustomDuration =
    customTarget === 'priority'
      ? priority.durationMinutes
      : secondaryTasks.find((t) => t.id === customTarget)?.durationMinutes || 30;

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 max-w-4xl mx-auto">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Main Central Question */}
        <h1 className="text-xl md:text-[25px] font-medium text-[#dfe2eb] text-center max-w-2xl leading-relaxed tracking-tight mb-8">
          What is the ONE THING you will do today for {context} and be satisfied with your day?
        </h1>

        {/* Priority 1 Card */}
        <div className="w-full max-w-[620px] bg-[#181c24]/90 border border-white/[0.08] rounded-2xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl relative transition-all">
          <div className="flex items-start gap-4">
            {/* Number 1 Badge */}
            <div className="w-10 h-10 rounded-full bg-[#12151d] border border-white/15 flex items-center justify-center text-white font-semibold text-base shrink-0 shadow-inner">
              1
            </div>

            {/* Editable Priority 1 Title */}
            <div className="flex-1">
              <input
                type="text"
                value={priority.title}
                onChange={(e) => onUpdatePriority({ title: e.target.value })}
                placeholder="Name your single critical priority..."
                className="w-full bg-transparent text-lg md:text-[22px] font-semibold text-[#f0f6fc] placeholder-[#4b5563] outline-none tracking-tight leading-snug"
              />
            </div>
          </div>

          {/* Dividing Line */}
          <div className="w-full h-[1px] bg-white/[0.07] my-5" />

          {/* Duration Pills */}
          <div className="flex flex-wrap items-center gap-2 pl-14">
            {durationOptions.map((opt) => {
              const selected = priority.durationMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => {
                    sounds.playClick(selected ? 1.0 : 1.2);
                    onUpdatePriority({ durationMinutes: opt.minutes });
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium font-tabular transition-all duration-150 cursor-pointer ${
                    selected
                      ? 'bg-[#232e42] border border-[#60a5fa]/50 text-white shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                      : 'bg-white/[0.03] border border-white/[0.06] text-[#8b91a0] hover:text-[#dfe2eb] hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

            {/* Custom Pill */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick(1.1);
                setCustomTarget('priority');
                setCustomModalOpen(true);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border cursor-pointer ${
                !isPresetSelected
                  ? 'bg-[#232e42] border-[#60a5fa]/50 text-white font-tabular shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  : 'bg-white/[0.03] border-white/[0.06] text-[#8b91a0] hover:text-[#dfe2eb] hover:bg-white/[0.06]'
              }`}
            >
              {!isPresetSelected ? `${priority.durationMinutes}m` : 'Custom...'}
            </button>
          </div>
        </div>

        {/* Secondary Tasks Stack with Time Selection */}
        <div className="w-full max-w-[620px] mt-6 flex flex-col gap-3 pl-3">
          {secondaryTasks.map((task, index) => {
            const taskNumber = index + 2;
            const isEditing = editingSecondaryId === task.id;
            const isSelectingTime = selectingTimeForTaskId === task.id;

            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 group py-1.5 px-2 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                {/* Index & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="font-tabular text-sm font-medium text-[#64748b] group-hover:text-[#8b91a0] w-5 text-center shrink-0">
                    {taskNumber}
                  </span>

                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={task.title}
                        onChange={(e) => onUpdateSecondaryTask(task.id, { title: e.target.value })}
                        onBlur={() => setEditingSecondaryId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingSecondaryId(null);
                        }}
                        className="flex-1 bg-[#161a22] border border-white/15 rounded px-2.5 py-1 text-white text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingSecondaryId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingSecondaryId(task.id)}
                      className="flex-1 text-left truncate text-sm font-normal text-[#8b91a0] group-hover:text-[#dfe2eb] transition-colors cursor-text"
                      title="Click to edit task title"
                    >
                      {task.title || `Task #${taskNumber}`}
                    </button>
                  )}
                </div>

                {/* Secondary Task Time Selection */}
                <div className="relative shrink-0 flex items-center gap-1.5">
                  {isSelectingTime ? (
                    <div className="flex items-center gap-1.5 bg-[#171b24] p-1 rounded-lg border border-white/15 shadow-xl animate-in fade-in duration-150">
                      {secondaryDurationPresets.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            sounds.playClick(1.2);
                            onUpdateSecondaryTask(task.id, { durationMinutes: mins });
                            setSelectingTimeForTaskId(null);
                          }}
                          className={`px-2 py-0.5 text-xs font-tabular rounded transition-colors ${
                            task.durationMinutes === mins
                              ? 'bg-[#3b82f6]/30 text-[#93c5fd] font-semibold border border-[#3b82f6]/40'
                              : 'text-[#8b91a0] hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick(1.1);
                          setCustomTarget(task.id);
                          setCustomModalOpen(true);
                          setSelectingTimeForTaskId(null);
                        }}
                        className="px-2 py-0.5 text-xs text-[#8b91a0] hover:text-white hover:bg-white/[0.05] rounded"
                      >
                        Custom...
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick(1.0);
                        setSelectingTimeForTaskId(task.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-xs font-tabular text-[#8b91a0] hover:text-[#dfe2eb] transition-all cursor-pointer"
                      title="Choose duration for this task"
                    >
                      <Clock className="w-3 h-3 text-[#64748b]" />
                      <span>{task.durationMinutes}m</span>
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
        {/* Left: Emergency Unlock */}
        <EmergencyUnlockButton holdSeconds={10} onUnlock={onEmergencyUnlock} />

        {/* Center: Shelf Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(1.0);
            onOpenShelf();
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#161a22] hover:bg-[#1f2532] border border-white/[0.08] text-xs font-medium text-[#dfe2eb] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5 text-[#8b91a0]" />
          <span>Shelf</span>
        </button>

        {/* Right: Commit Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playCommit();
            onCommit();
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
        >
          <span>Commit</span>
          <span className="flex items-center opacity-70 text-[10px] font-mono">
            <Command className="w-3 h-3" />
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Custom Duration Modal */}
      <CustomDurationModal
        isOpen={customModalOpen}
        currentDuration={currentCustomDuration}
        onClose={() => setCustomModalOpen(false)}
        onConfirm={(mins) => {
          if (customTarget === 'priority') {
            onUpdatePriority({ durationMinutes: mins });
          } else {
            onUpdateSecondaryTask(customTarget, { durationMinutes: mins });
          }
        }}
      />
    </div>
  );
};
