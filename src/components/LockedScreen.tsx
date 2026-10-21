import React, { useState } from 'react';
import {
  Clock,
  Check,
  Edit3,
  Command,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { CustomDurationModal } from './CustomDurationModal.tsx';

interface LockedScreenProps {
  priority: PriorityTask;
  secondaryTasks?: SecondaryTask[];
  onUpdatePriority: (updates: Partial<PriorityTask>) => void;
  onCompletePriority: () => void;
  onCloseWebpage: () => void;
  onOpenShelf?: () => void;
  onEmergencyUnlock?: () => void;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({
  priority,
  onUpdatePriority,
  onCompletePriority,
  onCloseWebpage,
}) => {
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

  // Requirement 1: "I am committed" closes the webpage entirely
  const handleCommitAndClose = () => {
    sounds.playCommit();
    onCloseWebpage();
  };

  // Requirement 2: Completing the main priority goes directly into the day won screen
  const handleBoxClick = () => {
    if (isEditing) return;
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

        {/* Hero Focus Card: Requirement 1 & 2: Hover shows green hint to mark done, click goes directly to Day Won */}
        <div
          onClick={handleBoxClick}
          className="group w-full max-w-[620px] rounded-2xl p-8 md:p-10 backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-center select-none cursor-pointer bg-[#181c24]/90 hover:bg-[#15221b]/80 border border-white/[0.08] hover:border-[#34d399]/50 shadow-[0_24px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_0_32px_rgba(52,211,153,0.18),0_28px_56px_rgba(0,0,0,0.75)]"
        >
          {/* Subtle electric cobalt sheen that transitions to emerald on hover */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-[#aac7ff]/60 group-hover:via-[#34d399]/80 to-transparent transition-all duration-300" />

          {/* Top-Right Quick Action Hover Buttons (Edit) */}
          {!isEditing && (
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          )}

          {isEditing ? (
            /* In-place Editing Form */
            <form
              onSubmit={handleSaveEdit}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-5 cursor-default"
            >
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
              {/* Number 1 Badge: Switches to green checkmark on hover */}
              <div className="w-10 h-10 rounded-full border border-white/15 group-hover:border-[#34d399]/70 bg-[#12151d] group-hover:bg-[#122820] text-white group-hover:text-[#34d399] flex items-center justify-center font-semibold text-base mx-auto mb-6 shadow-inner transition-all duration-200">
                <span className="group-hover:hidden">1</span>
                <Check className="w-4 h-4 hidden group-hover:inline stroke-[2.5]" />
              </div>

              {/* Large Hero Text */}
              <h2 className="text-2xl md:text-[29px] font-semibold text-center leading-snug tracking-tight max-w-lg mx-auto mb-7 text-[#f0f6fc]">
                {priority.title || 'One crucial priority'}
              </h2>

              {/* Static Duration Pill: Accents green on hover */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium font-tabular bg-white/[0.04] group-hover:bg-[#122820]/80 text-[#8b91a0] group-hover:text-[#34d399] border border-white/[0.08] group-hover:border-[#34d399]/35 transition-all duration-200 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{priority.durationMinutes}m</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Bar: Requirement 1: "I am committed" button closes the webpage entirely */}
      <div className="w-full max-w-5xl flex items-center justify-end pt-6 border-t border-transparent">
        <button
          type="button"
          onClick={handleCommitAndClose}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
        >
          <span>I am committed</span>
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
