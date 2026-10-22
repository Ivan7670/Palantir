import React from 'react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface DayWonScreenProps {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onUndoComplete: () => void;
  onMinimizeWindow: () => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
  onOpenShelf: () => void;
  onOpenSettings: () => void;
}

export const DayWonScreen: React.FC<DayWonScreenProps> = ({
  priority,
  secondaryTasks,
  onUndoComplete,
  onMinimizeWindow,
  onUpdateSecondaryTask,
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

  const handleToggleSecondaryComplete = (taskId: string, currentCompleted: boolean) => {
    sounds.playClick(currentCompleted ? 0.9 : 1.3);
    onUpdateSecondaryTask(taskId, { completed: !currentCompleted });
  };

  const handleGoodWork = () => {
    sounds.playCommit();
    onMinimizeWindow();
  };

  const visibleSecondaryTasks = secondaryTasks.filter(
    (t) => t.title && t.title.trim().length > 0
  );

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-6 sm:px-12 max-w-5xl mx-auto select-none">
      {/* Central Completed Focus & Revealed Optional Tasks: Left aligned in middle */}
      <div className="w-full flex-1 flex flex-col items-start justify-center my-auto py-8">
        <div className="w-full max-w-4xl flex flex-col items-start text-left">
          {/* Completed Checkmark Circle: Clicking undoes completion */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(0.9);
              onUndoComplete();
            }}
            className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-all cursor-pointer mb-6"
            title="Click to undo completion"
          >
            <svg
              className="w-6 h-6 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Strikethrough Completed Title (3x larger, left aligned, bolded Cal Sans) */}
          <h1
            onClick={() => {
              sounds.playClick(0.9);
              onUndoComplete();
            }}
            style={{ fontFamily: "'Cal Sans', var(--font-cal)" }}
            className="w-full text-5xl sm:text-7xl md:text-8xl lg:text-[100px] xl:text-[116px] font-cal font-bold tracking-tight text-neutral-400 line-through leading-[1.02] sm:leading-[0.95] text-left cursor-pointer hover:text-neutral-500 transition-colors"
            title="Click to undo completion"
          >
            {priority.title || 'One crucial priority'}
          </h1>

          {/* Duration Display (Left aligned) */}
          <div className="text-base sm:text-lg font-bold text-neutral-400 mt-4 text-left">
            {formatDuration(priority.durationMinutes)}
          </div>

          {/* Revealed Optional Tasks 2 & 3 (Only visible once priority is marked done!) */}
          {visibleSecondaryTasks.length > 0 && (
            <div className="w-full max-w-xl mt-12 flex flex-col gap-3.5 animate-in fade-in duration-300 text-left">
              {visibleSecondaryTasks.map((task, idx) => {
                const taskNum = idx + 2;
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleSecondaryComplete(task.id, task.completed)}
                    className="flex items-center gap-3.5 py-1.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group/sec"
                  >
                    {/* Circle checkbox */}
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-neutral-300 group-hover/sec:border-neutral-400'
                      }`}
                    >
                      {task.completed && (
                        <svg
                          className="w-3 h-3 stroke-[3]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <span className="text-sm font-bold text-neutral-400 shrink-0">
                      {taskNum}.
                    </span>

                    <span
                      className={`flex-1 text-base sm:text-lg font-medium transition-colors ${
                        task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                      }`}
                    >
                      {task.title}
                    </span>

                    <span className="text-xs font-semibold text-neutral-400 shrink-0 font-tabular">
                      {task.durationMinutes}m
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Settings Gear (Left), Caret Shelf Toggle (Center), Good work → (Right) */}
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

        {/* Bottom Right: "Good work →" (Minimizes window) */}
        <button
          type="button"
          onClick={handleGoodWork}
          className="text-base sm:text-lg font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          title="Minimize window (Cmd+M)"
        >
          <span>Good work</span>
          <span className="text-xl">→</span>
        </button>
      </footer>
    </div>
  );
};
