import React, { useState } from 'react';
import { PriorityTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface LockedScreenProps {
  priority: PriorityTask;
  onCompletePriority: () => void;
  onCloseTab?: () => void;
  onEditPriority: () => void;
  onOpenShelf: () => void;
  onOpenSettings: () => void;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({
  priority,
  onCompletePriority,
  onCloseTab,
  onEditPriority,
  onOpenShelf,
  onOpenSettings,
}) => {
  const [tabCloseNotice, setTabCloseNotice] = useState(false);

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `${hrs}hr ${rem}m` : `${hrs}hr`;
    }
    return `${mins}m`;
  };

  const handleCommitAndCloseTab = () => {
    sounds.playCommit();
    // Cross-browser attempts to close the tab
    window.close();
    try {
      window.open('', '_self', '');
      window.close();
    } catch {}

    if (onCloseTab) {
      onCloseTab();
    }

    setTimeout(() => {
      setTabCloseNotice(true);
    }, 150);
  };

  const handleToggleComplete = () => {
    sounds.playDayWon();
    onCompletePriority();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-start px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto select-none">
      {/* Central Big Focus Display: Left aligned directly with top One Focus header */}
      <div className="w-full flex-1 flex flex-col items-start justify-center my-auto py-8">
        <div className="w-full flex flex-col items-start text-left group/main">
          {/* Main priority container: circle takes 0 space by default, expands to push text when hovered; clicking big text completes */}
          <div
            onClick={handleToggleComplete}
            className="flex items-start w-full cursor-pointer select-none"
            title="Click to mark priority as complete"
          >
            {/* Circle Checkbox on the left: 0 space when not hovered, smoothly pushes text to fit when hovered */}
            <div className="w-0 opacity-0 group-hover/main:w-10 sm:group-hover/main:w-13 md:group-hover/main:w-15 group-hover/main:mr-4 sm:group-hover/main:mr-6 group-hover/main:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 flex items-start">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete();
                }}
                className="mt-3 sm:mt-5 md:mt-7 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2 border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-neutral-400 hover:text-emerald-600 transition-all cursor-pointer shrink-0 shadow-xs"
                title="Click to mark priority as complete"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            {/* Giant Title: Flush left identical to original screen when not hovered, pushed when hovered, anti-clipping line-height */}
            <h1
              style={{ fontFamily: "'Cal Sans', var(--font-cal)" }}
              className="flex-1 text-6xl sm:text-7xl md:text-8xl lg:text-[128px] font-cal font-bold tracking-tight text-neutral-900 leading-[1.18] sm:leading-[1.14] pt-2 pb-6 px-1 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-85"
            >
              {priority.title || 'One crucial priority'}
            </h1>
          </div>

          {/* Duration & Separate Edit Button (Edit only appears on hover) */}
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-neutral-400 mt-2 pl-0">
            <span>{formatDuration(priority.durationMinutes)}</span>
            <span className="opacity-0 group-hover/main:opacity-100 transition-opacity duration-200 text-neutral-300">
              ·
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick(1.0);
                onEditPriority();
              }}
              className="opacity-0 group-hover/main:opacity-100 transition-opacity duration-200 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-neutral-900 underline underline-offset-4 cursor-pointer"
              title="Edit priority"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Settings Gear (Left), Caret Shelf Toggle (Center), "I am committed →" (Right) */}
      <footer className="w-full flex items-center justify-between pb-8 pt-4 z-20">
        {/* Bottom Left: Settings Gear */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(1.0);
            onOpenSettings();
          }}
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
          title="Settings (Cmd+,)"
        >
          <svg
            className="w-5 h-5 stroke-[1.8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Bottom Center: Shelf Caret Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(1.0);
            onOpenShelf();
          }}
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer group"
          title="Open Shelf ('s')"
        >
          <svg
            className="w-5 h-5 stroke-[2] transform transition-transform group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Bottom Right: "I am committed →" (Closes tab) */}
        <button
          type="button"
          onClick={handleCommitAndCloseTab}
          className="text-base sm:text-lg font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          title="Commit to focus and close tab"
        >
          <span>I am committed</span>
          <span className="text-xl">→</span>
        </button>
      </footer>

      {/* Reassurance notice if browser policy blocks script tab closing */}
      {tabCloseNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Locked in. You can close this tab now to focus.</span>
        </div>
      )}
    </div>
  );
};
