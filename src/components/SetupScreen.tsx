import React, { useState, useRef, useEffect } from 'react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { CustomDurationModal } from './CustomDurationModal.tsx';

interface SetupScreenProps {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onUpdatePriority: (updates: Partial<PriorityTask>) => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
  onCommit: () => void;
  onOpenShelf: () => void;
  onOpenSettings: () => void;
  shelfCount?: number;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  priority,
  secondaryTasks,
  onUpdatePriority,
  onUpdateSecondaryTask,
  onCommit,
  onOpenShelf,
  onOpenSettings,
}) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customTarget, setCustomTarget] = useState<'priority' | string>('priority');
  const [validationAttempted, setValidationAttempted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus priority textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea to fit content seamlessly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [priority.title]);

  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  const wordCount = countWords(priority.title);
  const hasTyped = priority.title.trim().length > 0;
  const isSatisfied = wordCount >= 6;

  const durationOptions = [
    { label: '5m', minutes: 5 },
    { label: '10m', minutes: 10 },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1hr', minutes: 60 },
  ];

  const handleDurationSelect = (mins: number) => {
    sounds.playClick(1.0);
    onUpdatePriority({ durationMinutes: mins });
  };

  const handleCommit = () => {
    if (!isSatisfied) {
      sounds.playClick(0.6);
      setValidationAttempted(true);
      textareaRef.current?.focus();
      return;
    }
    sounds.playCommit();
    onCommit();
  };

  const currentCustomMinutes =
    customTarget === 'priority'
      ? priority.durationMinutes
      : secondaryTasks.find((t) => t.id === customTarget)?.durationMinutes || 15;

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-6 sm:px-12 max-w-5xl mx-auto select-none">
      {/* Central Interactive Focus Area: Left aligned in middle */}
      <div className="w-full flex-1 flex flex-col items-start justify-center my-auto py-8">
        <div className="w-full max-w-4xl flex flex-col items-start text-left">
          {/* Giant Editable Priority Title (3x larger, left aligned) */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={priority.title}
            onChange={(e) => {
              onUpdatePriority({ title: e.target.value });
              if (validationAttempted) setValidationAttempted(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommit();
              }
            }}
            placeholder="One thing to satisfy your day."
            className="w-full bg-transparent text-5xl sm:text-7xl md:text-8xl lg:text-[100px] xl:text-[116px] font-black tracking-tight text-neutral-900 placeholder-neutral-300 outline-none resize-none text-left leading-[1.02] sm:leading-[0.95] border-none focus:ring-0 p-0"
          />

          {/* Live Word Count Validation Feedback with consistent dot on both */}
          {hasTyped && !isSatisfied && (
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#e05252] animate-in fade-in duration-150 text-left">
              <span className="w-2 h-2 rounded-full bg-[#e05252] shrink-0" />
              <span>Minimum 6 words · Current {wordCount}</span>
            </div>
          )}

          {validationAttempted && !hasTyped && (
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#e05252] animate-in fade-in duration-150 text-left">
              <span className="w-2 h-2 rounded-full bg-[#e05252] shrink-0" />
              <span>Minimum 6 words · Current 0</span>
            </div>
          )}

          {hasTyped && isSatisfied && (
            <div className="mt-5 flex items-center gap-2 text-xs font-medium tracking-wide text-neutral-400 animate-in fade-in duration-150 text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Minimum 6 words satisfied · {wordCount} words</span>
            </div>
          )}

          {/* Duration Selector (Only appears after user types the big task, left aligned) */}
          {hasTyped && (
            <div className="mt-8 flex items-center justify-start gap-4 sm:gap-6 flex-wrap animate-in fade-in duration-200">
              {durationOptions.map((opt) => {
                const isSelected = priority.durationMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => handleDurationSelect(opt.minutes)}
                    className={`text-base sm:text-lg transition-colors cursor-pointer px-1 py-0.5 ${
                      isSelected
                        ? 'font-bold text-neutral-900 underline underline-offset-8 decoration-2'
                        : 'font-normal text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}

              {/* Custom + Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(1.1);
                  setCustomTarget('priority');
                  setCustomModalOpen(true);
                }}
                className={`text-base sm:text-lg transition-colors cursor-pointer px-1 py-0.5 ${
                  !durationOptions.some((d) => d.minutes === priority.durationMinutes)
                    ? 'font-bold text-neutral-900 underline underline-offset-8 decoration-2'
                    : 'font-normal text-neutral-400 hover:text-neutral-700'
                }`}
                title="Custom duration"
              >
                {!durationOptions.some((d) => d.minutes === priority.durationMinutes)
                  ? `${priority.durationMinutes}m`
                  : '+'}
              </button>
            </div>
          )}

          {/* Optional Tasks 2 & 3 (Only appear after user types the big task) */}
          {hasTyped && (
            <div className="w-full max-w-xl mt-12 flex flex-col gap-3 animate-in fade-in duration-300 text-left">
              {secondaryTasks.map((task, idx) => {
                const taskNum = idx + 2;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-1 group/sec transition-colors"
                  >
                    <span className="text-base sm:text-lg font-bold text-neutral-400 shrink-0 w-6">
                      {taskNum}.
                    </span>

                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => onUpdateSecondaryTask(task.id, { title: e.target.value })}
                      placeholder="Optional task"
                      className="flex-1 bg-transparent text-base sm:text-lg font-medium text-neutral-800 placeholder-neutral-300 outline-none border-none focus:ring-0 p-0"
                    />

                    {task.title.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick(1.0);
                          setCustomTarget(task.id);
                          setCustomModalOpen(true);
                        }}
                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors shrink-0"
                        title="Change duration"
                      >
                        {task.durationMinutes}m
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Settings Gear (Left), Caret Shelf Toggle (Center), Commit Button (Right) */}
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

        {/* Bottom Right: Commit Action */}
        <button
          type="button"
          onClick={handleCommit}
          className="text-base sm:text-lg font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Commit</span>
          <span className="text-xl">→</span>
        </button>
      </footer>

      {/* Custom Duration Modal */}
      <CustomDurationModal
        isOpen={customModalOpen}
        currentDuration={currentCustomMinutes}
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
