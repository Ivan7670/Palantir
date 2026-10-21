import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  Edit3,
  Archive,
  Command,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { EmergencyUnlockButton } from './EmergencyUnlockButton.tsx';
import { CustomDurationModal } from './CustomDurationModal.tsx';

interface LockedScreenProps {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onUpdatePriority: (updates: Partial<PriorityTask>) => void;
  onCompletePriority: () => void;
  onOpenShelf: () => void;
  onEmergencyUnlock: () => void;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({
  priority,
  secondaryTasks,
  onUpdatePriority,
  onCompletePriority,
  onOpenShelf,
  onEmergencyUnlock,
}) => {
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(priority.title);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const durationOptions = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '45m', minutes: 45 },
    { label: '1h', minutes: 60 },
    { label: '90m', minutes: 90 },
  ];

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      sounds.playClick(1.2);
      onUpdatePriority({ title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    sounds.playClick(0.9);
    setEditTitle(priority.title);
    setIsEditing(false);
  };

  const handleMarkDone = () => {
    sounds.playDayWon();
    onCompletePriority();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 max-w-4xl mx-auto">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Status Kicker */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#8b91a0] uppercase">
            THIS IS THE PRIORITY
          </span>
        </div>

        {/* Hero Focus Card with Hover Effects */}
        <div className="group w-full max-w-[620px] bg-[#181c24]/90 border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-8 md:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-center">
          {/* Subtle electric cobalt sheen along top rim */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-[#aac7ff]/60 to-transparent" />

          {/* Top-Right Quick Action Hover Buttons (Mark Done + Edit) */}
          {!isEditing && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {/* Edit button on hover */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(1.1);
                  setEditTitle(priority.title);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#8b91a0] hover:text-white transition-all shadow-md cursor-pointer"
                title="Edit priority"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>

              {/* Mark as Done button on hover */}
              <button
                type="button"
                onClick={handleMarkDone}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#122820] hover:bg-[#17352b] border border-[#34d399]/40 text-xs font-medium text-[#34d399] transition-all shadow-[0_0_12px_rgba(52,211,153,0.2)] cursor-pointer"
                title="Mark this priority as complete"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark Done</span>
              </button>
            </div>
          )}

          {isEditing ? (
            /* In-place Editing Form */
            <form onSubmit={handleSaveEdit} className="flex flex-col items-center gap-5">
              <div className="w-10 h-10 rounded-full bg-[#12151d] border border-white/15 flex items-center justify-center text-white font-semibold text-base mx-auto shadow-inner">
                1
              </div>

              <div className="w-full">
                <label className="block text-xs text-[#8b91a0] mb-2 font-medium">
                  Edit Priority Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#12161f] border border-white/20 rounded-xl px-4 py-2.5 text-lg font-semibold text-[#f0f6fc] outline-none focus:border-[#3b82f6] text-center"
                />
              </div>

              {/* Duration picker pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => {
                      sounds.playClick(1.1);
                      onUpdatePriority({ durationMinutes: opt.minutes });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-tabular transition-colors ${
                      priority.durationMinutes === opt.minutes
                        ? 'bg-[#232e42] border border-[#60a5fa]/50 text-white'
                        : 'bg-white/[0.04] text-[#8b91a0] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.0);
                    setCustomModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-full text-xs text-[#8b91a0] hover:text-white bg-white/[0.04] border border-white/[0.06]"
                >
                  Custom...
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs text-[#8b91a0] hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#0a84ff] hover:brightness-110 transition-all shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* Normal Display Mode */
            <>
              {/* Number 1 Badge with Hover Effect to Mark as Done */}
              <button
                type="button"
                onClick={handleMarkDone}
                className="group/badge w-10 h-10 rounded-full bg-[#12151d] border border-white/15 group-hover:border-[#34d399]/60 group-hover:bg-[#122820] group-hover:text-[#34d399] flex items-center justify-center text-white font-semibold text-base mx-auto mb-6 shadow-inner transition-all duration-200 cursor-pointer relative"
                title="Click to mark as done"
              >
                <span className="group-hover/badge:hidden">1</span>
                <Check className="w-4 h-4 hidden group-hover/badge:inline stroke-[2.5]" />
              </button>

              {/* Large Hero Text */}
              <h2 className="text-2xl md:text-[29px] font-semibold text-[#f0f6fc] text-center leading-snug tracking-tight max-w-lg mx-auto mb-7">
                {priority.title || 'One crucial priority'}
              </h2>

              {/* Static Duration Pill (Timer removed per request) */}
              <div className="inline-flex items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium font-tabular bg-white/[0.04] text-[#8b91a0] border border-white/[0.08]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{priority.durationMinutes}m</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Collapsible Next Tasks */}
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              setTasksExpanded(!tasksExpanded);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#8b91a0] hover:text-[#dfe2eb] transition-colors py-1 px-3 rounded-lg hover:bg-white/[0.03] cursor-pointer"
          >
            <span>Next tasks ({secondaryTasks.length})</span>
            {tasksExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {tasksExpanded && (
            <div
              style={{ width: '420px' }}
              className="w-[420px] max-w-full mt-4 flex flex-col gap-2.5 p-4 rounded-xl bg-[#141820]/70 border border-white/[0.05] animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {secondaryTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between text-xs text-[#8b91a0] py-1 border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-tabular font-medium text-[#64748b]">{idx + 2}</span>
                    <span className="truncate">{task.title || 'optional tasks'}</span>
                  </div>
                  <span className="font-tabular text-[11px] text-[#64748b] shrink-0">
                    {task.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
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

        {/* Right: Begin Focus button */}
        <button
          type="button"
          onClick={handleMarkDone}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
        >
          <span>Begin Focus</span>
          <span className="flex items-center opacity-70 text-[10px] font-mono">
            <Command className="w-3 h-3" />
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Custom Duration Modal */}
      <CustomDurationModal
        isOpen={customModalOpen}
        currentDuration={priority.durationMinutes}
        onClose={() => setCustomModalOpen(false)}
        onConfirm={(mins) => onUpdatePriority({ durationMinutes: mins })}
      />
    </div>
  );
};
