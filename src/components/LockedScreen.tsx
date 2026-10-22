import React from 'react';
import { PriorityTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface LockedScreenProps {
  priority: PriorityTask;
  onCompletePriority: () => void;
  onMinimizeWindow: () => void;
  onEditPriority: () => void;
  onOpenShelf: () => void;
  onOpenSettings: () => void;
}

export const LockedScreen: React.FC<LockedScreenProps> = ({
  priority,
  onCompletePriority,
  onMinimizeWindow,
  onEditPriority,
  onOpenShelf,
  onOpenSettings,
}) => {
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `${hrs}hr ${rem}m` : `${hrs}hr`;
    }
    return `${mins}m`;
  };

  const handleCommitAndMinimize = () => {
    sounds.playCommit();
    onMinimizeWindow();
  };

  const handleToggleComplete = () => {
    sounds.playDayWon();
    onCompletePriority();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto select-none">
      {/* Central Big Focus Display: Left aligned in middle with generous length */}
      <div className="w-full flex-1 flex flex-col items-start justify-center my-auto py-8">
        <div className="w-full max-w-6xl flex flex-col items-start text-left">
          {/* Complete Checkbox Affordance + Giant Editable Priority Title */}
          <div className="w-full flex flex-col items-start gap-6">
            <button
              type="button"
              onClick={handleToggleComplete}
              className="w-12 h-12 rounded-full border-2 border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-neutral-400 hover:text-emerald-600 transition-all cursor-pointer group/circle shadow-sm"
              title="Click to mark priority as complete"
            >
              <svg
                className="w-6 h-6 opacity-0 group-hover/circle:opacity-100 transition-opacity stroke-[2.5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            {/* Giant Title (Longer box, 3x larger, bolded Cal Sans, anti-clipping leading & padding): Clicking text returns directly to setup screen */}
            <h1
              onClick={() => {
                sounds.playClick(1.0);
                onEditPriority();
              }}
              style={{ fontFamily: "'Cal Sans', var(--font-cal)" }}
              className="w-full text-5xl sm:text-7xl md:text-8xl lg:text-[100px] xl:text-[116px] font-cal font-bold tracking-tight text-neutral-900 leading-[1.12] sm:leading-[1.08] pb-3 text-left cursor-pointer hover:opacity-75 transition-opacity"
              title="Click to edit priority"
            >
              {priority.title || 'One crucial priority'}
            </h1>

            {/* Duration Display (Left aligned) */}
            <div className="text-base sm:text-lg font-bold text-neutral-400 text-left">
              {formatDuration(priority.durationMinutes)}
            </div>
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

        {/* Bottom Right: "I am committed →" (Minimizes window) */}
        <button
          type="button"
          onClick={handleCommitAndMinimize}
          className="text-base sm:text-lg font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          title="Minimize window into focus dock (Cmd+M)"
        >
          <span>I am committed</span>
          <span className="text-xl">→</span>
        </button>
      </footer>
    </div>
  );
};
