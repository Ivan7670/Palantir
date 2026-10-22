import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PriorityTask, SecondaryTask } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import { CustomDurationModal } from './CustomDurationModal.tsx';

interface SetupScreenProps {
  priority: PriorityTask;
  secondaryTasks: SecondaryTask[];
  onUpdatePriority: (updates: Partial<PriorityTask>) => void;
  onUpdateSecondaryTask: (id: string, updates: Partial<SecondaryTask>) => void;
  onAddToShelf: (item: { title: string; durationMinutes: number }) => void;
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
  onAddToShelf,
  onCommit,
  onOpenShelf,
  onOpenSettings,
}) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customTarget, setCustomTarget] = useState<'priority' | string>('priority');
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [shelfFeedback, setShelfFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus priority textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const showShelfToast = (msg: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setShelfFeedback(msg);
    feedbackTimeoutRef.current = setTimeout(() => {
      setShelfFeedback(null);
    }, 3200);
  };

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.max(scrollH + 32, 160)}px`;
  }, []);

  // Auto-resize textarea to fit content seamlessly without clipping
  useEffect(() => {
    resizeTextarea();
  }, [priority.title, resizeTextarea]);

  // Recalculate on window resize & font load to guarantee perfect fit
  useEffect(() => {
    window.addEventListener('resize', resizeTextarea);
    if (document.fonts?.ready) {
      document.fonts.ready.then(resizeTextarea);
    }
    return () => window.removeEventListener('resize', resizeTextarea);
  }, [resizeTextarea]);

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
    // If a task is selected at 15m, 10m, or 5m it immediately goes into the shelf
    if (mins <= 15 && priority.title.trim().length > 0) {
      const taskTitle = priority.title.trim();
      sounds.playShelfAdd();
      onAddToShelf({ title: taskTitle, durationMinutes: mins });
      onUpdatePriority({ title: '', durationMinutes: 60 });
      showShelfToast(`Moved "${taskTitle.length > 30 ? taskTitle.slice(0, 30) + '…' : taskTitle}" to shelf (${mins}m)`);
      return;
    }
    sounds.playClick(1.0);
    onUpdatePriority({ durationMinutes: mins });
  };

  const handleSecondaryDurationSelect = (task: SecondaryTask, mins: number) => {
    // If a task is selected at 15m, 10m, or 5m it immediately goes into the shelf
    if (mins <= 15) {
      if (task.title.trim().length > 0) {
        const taskTitle = task.title.trim();
        sounds.playShelfAdd();
        onAddToShelf({ title: taskTitle, durationMinutes: mins });
        onUpdateSecondaryTask(task.id, { title: '', durationMinutes: 0 });
        showShelfToast(`Moved "${taskTitle.length > 30 ? taskTitle.slice(0, 30) + '…' : taskTitle}" to shelf (${mins}m)`);
        return;
      }
    }
    sounds.playClick(1.0);
    onUpdateSecondaryTask(task.id, { durationMinutes: mins });
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
      : secondaryTasks.find((t) => t.id === customTarget)?.durationMinutes || 30;

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-start px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto select-none">
      {/* Central Interactive Focus Area: Left aligned directly with top One Focus header */}
      <div className="w-full flex-1 flex flex-col items-start justify-center my-auto py-8">
        <div className="w-full flex flex-col items-start text-left">
          {/* Giant Editable Priority Title (Expands to fit, bolded Cal Sans, anti-clipping line-height) */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={priority.title}
            onChange={(e) => {
              onUpdatePriority({ title: e.target.value });
              if (validationAttempted) setValidationAttempted(false);
              // Instant auto-expansion on keystroke
              e.target.style.height = '0px';
              e.target.style.height = `${Math.max(e.target.scrollHeight + 32, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommit();
              }
            }}
            placeholder="One thing to satisfy your day."
            style={{ fontFamily: "'Cal Sans', var(--font-cal)" }}
            className="w-full bg-transparent font-cal font-bold text-6xl sm:text-7xl md:text-8xl lg:text-[128px] tracking-tight text-neutral-900 placeholder-neutral-300 outline-none resize-none text-left leading-[1.18] sm:leading-[1.14] border-none focus:ring-0 p-0 pt-2 pb-6 px-1 overflow-hidden block"
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
            <div className="w-full max-w-2xl mt-12 flex flex-col gap-3.5 animate-in fade-in duration-300 text-left">
              {secondaryTasks.map((task, idx) => {
                const taskNum = idx + 2;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-1.5 group/sec transition-colors relative min-h-[36px]"
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

                    {/* Shows the time after selecting, does not start with one */}
                    {task.durationMinutes !== undefined && task.durationMinutes > 0 && (
                      <span className="text-xs sm:text-sm font-semibold text-neutral-400 font-tabular shrink-0 group-hover/sec:hidden">
                        {task.durationMinutes >= 60 ? '1hr' : `${task.durationMinutes}m`}
                      </span>
                    )}

                    {/* Available times appear on hover */}
                    <div className="hidden group-hover/sec:flex items-center gap-1.5 transition-opacity duration-150 shrink-0 select-none">
                      {[5, 10, 15, 30, 60].map((mins) => {
                        const label = mins === 60 ? '1hr' : `${mins}m`;
                        const isSelected = task.durationMinutes === mins;
                        const isShelfMins = mins <= 15;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => handleSecondaryDurationSelect(task, mins)}
                            className={`text-xs px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                              isSelected
                                ? 'font-bold text-neutral-900 underline underline-offset-4'
                                : 'font-normal text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                            }`}
                            title={isShelfMins ? `${label} → Move to shelf` : `Set duration to ${label}`}
                          >
                            {label}
                          </button>
                        );
                      })}

                      {/* Custom + */}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick(1.0);
                          setCustomTarget(task.id);
                          setCustomModalOpen(true);
                        }}
                        className={`text-xs font-semibold px-1.5 py-0.5 hover:bg-neutral-100 rounded transition-colors cursor-pointer ${
                          task.durationMinutes && ![5, 10, 15, 30, 60].includes(task.durationMinutes)
                            ? 'font-bold text-neutral-900 underline underline-offset-4'
                            : 'text-neutral-400 hover:text-neutral-900'
                        }`}
                        title="Custom duration"
                      >
                        {task.durationMinutes && ![5, 10, 15, 30, 60].includes(task.durationMinutes)
                          ? `${task.durationMinutes}m`
                          : '+'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating feedback notification when task moves to the shelf */}
      {shelfFeedback && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>{shelfFeedback}</span>
        </div>
      )}

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
            if (mins <= 15 && priority.title.trim().length > 0) {
              const taskTitle = priority.title.trim();
              sounds.playShelfAdd();
              onAddToShelf({ title: taskTitle, durationMinutes: mins });
              onUpdatePriority({ title: '', durationMinutes: 60 });
              showShelfToast(`Moved "${taskTitle.length > 30 ? taskTitle.slice(0, 30) + '…' : taskTitle}" to shelf (${mins}m)`);
            } else {
              onUpdatePriority({ durationMinutes: mins });
            }
          } else {
            const task = secondaryTasks.find((t) => t.id === customTarget);
            if (task) {
              handleSecondaryDurationSelect(task, mins);
            }
          }
        }}
      />
    </div>
  );
};
