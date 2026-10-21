import React from 'react';
import {
  Clock,
  Check,
  Edit3,
  Command,
  CornerDownLeft,
} from 'lucide-react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface LockedScreenProps {
  priority: PriorityTask;
  secondaryTasks?: SecondaryTask[];
  onUpdatePriority?: (updates: Partial<PriorityTask>) => void;
  onCompletePriority: () => void;
  onMinimizeWindow: () => void;
  onEditPriority: () => void;
  onOpenShelf?: () => void;
  onEmergencyUnlock?: () => void;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({
  priority,
  onCompletePriority,
  onMinimizeWindow,
  onEditPriority,
}) => {
  // "I am committed" minimizes the window for web app usage
  const handleCommitAndMinimize = () => {
    sounds.playCommit();
    onMinimizeWindow();
  };

  // Completing the main priority goes directly into the day won screen
  const handleBoxClick = () => {
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

        {/* Hero Focus Card: Hover shows green hint to mark done, click goes directly to Day Won */}
        <div
          onClick={handleBoxClick}
          className="group w-full max-w-[620px] rounded-2xl p-8 md:p-10 backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-center select-none cursor-pointer bg-[#181c24]/90 hover:bg-[#15221b]/80 border border-white/[0.08] hover:border-[#34d399]/50 shadow-[0_24px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_0_32px_rgba(52,211,153,0.18),0_28px_56px_rgba(0,0,0,0.75)]"
        >
          {/* Subtle electric cobalt sheen that transitions to emerald on hover */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-[#aac7ff]/60 group-hover:via-[#34d399]/80 to-transparent transition-all duration-300" />

          {/* Top-Right Quick Action Hover Buttons: Clicking Edit returns to the first screen */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                sounds.playClick(1.0);
                onEditPriority();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 text-xs text-[#8b91a0] hover:text-white transition-all shadow-md cursor-pointer"
              title="Edit priority on setup screen"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

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
        </div>
      </div>

      {/* Bottom Action Bar: "I am committed" button minimizes the app window for web app usage */}
      <div className="w-full max-w-5xl flex items-center justify-end pt-6 border-t border-transparent">
        <button
          type="button"
          onClick={handleCommitAndMinimize}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1b2330] hover:bg-[#253245] border border-white/[0.1] text-xs font-semibold text-white tracking-wide transition-all shadow-md hover:border-white/20 active:scale-95 cursor-pointer"
          title="Commit priority and minimize to compact focus dock"
        >
          <span>I am committed</span>
          <span className="flex items-center opacity-70 text-[10px] font-mono">
            <Command className="w-3 h-3" />
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </button>
      </div>
    </div>
  );
};
