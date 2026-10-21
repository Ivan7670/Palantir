import React, { useState, useRef } from 'react';
import { Archive, CornerDownLeft, Command, Clock, Check } from 'lucide-react';
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
  onAddShelfItem?: (item: { title: string; durationMinutes: number }) => void;
  shelfCount?: number;
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
  onAddShelfItem,
  shelfCount = 0,
}) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customTarget, setCustomTarget] = useState<'priority' | string>('priority');
  const [hoveredTimeTaskId, setHoveredTimeTaskId] = useState<string | null>(null);
  const [showValidationNotice, setShowValidationNotice] = useState(false);

  const priorityCardRef = useRef<HTMLDivElement>(null);
  const shelfButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-move animation state (Requirement 5)
  const [flyingTask, setFlyingTask] = useState<{
    title: string;
    durationMinutes: number;
    startLeft: number;
    startTop: number;
    endLeft: number;
    endTop: number;
    isAnimating: boolean;
  } | null>(null);

  const [isShelfBouncing, setIsShelfBouncing] = useState(false);
  const [shelfNotice, setShelfNotice] = useState<string | null>(null);

  const durationOptions = [
    { label: '5m', minutes: 5 },
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
  ];

  const secondaryDurationPresets = [15, 30, 45, 60];

  const isPresetSelected = durationOptions.some((opt) => opt.minutes === priority.durationMinutes);

  // Helper to count words
  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  const p1WordCount = countWords(priority.title);
  const p1HasText = priority.title.trim().length > 0;
  const p1Valid = p1WordCount >= 6;

  const currentCustomDuration =
    customTarget === 'priority'
      ? priority.durationMinutes
      : secondaryTasks.find((t) => t.id === customTarget)?.durationMinutes || 30;

  // Requirement 5: If a task duration is set to <= 15 minutes, automatically move it to the shelf and reset priority with flying animation
  const handleSetPriorityDuration = (minutes: number) => {
    if (minutes <= 15) {
      const taskTitle = priority.title.trim() || 'Micro-task';
      const cardRect = priorityCardRef.current?.getBoundingClientRect();
      const shelfRect = shelfButtonRef.current?.getBoundingClientRect();

      if (cardRect && shelfRect) {
        const startLeft = cardRect.left + cardRect.width / 2 - 130;
        const startTop = cardRect.top + cardRect.height / 2 - 24;
        const endLeft = shelfRect.left + shelfRect.width / 2 - 130;
        const endTop = shelfRect.top + shelfRect.height / 2 - 24;

        setFlyingTask({
          title: taskTitle,
          durationMinutes: minutes,
          startLeft,
          startTop,
          endLeft,
          endTop,
          isAnimating: false,
        });

        // Trigger smooth trajectory in next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFlyingTask((prev) => (prev ? { ...prev, isAnimating: true } : null));
          });
        });

        // Reset priority input to empty with 30m default
        onUpdatePriority({ title: '', durationMinutes: 30 });

        setTimeout(() => {
          sounds.playShelfAdd();
          if (onAddShelfItem) {
            onAddShelfItem({ title: taskTitle, durationMinutes: minutes });
          }
          setFlyingTask(null);
          setIsShelfBouncing(true);
          const truncated = taskTitle.length > 22 ? taskTitle.slice(0, 22) + '...' : taskTitle;
          setShelfNotice(`"${truncated}" moved to Shelf (≤15m)`);

          setTimeout(() => setIsShelfBouncing(false), 700);
          setTimeout(() => setShelfNotice(null), 3200);
        }, 550);
      } else {
        sounds.playShelfAdd();
        if (onAddShelfItem) {
          onAddShelfItem({ title: taskTitle, durationMinutes: minutes });
        }
        onUpdatePriority({ title: '', durationMinutes: 30 });
        setIsShelfBouncing(true);
        setTimeout(() => setIsShelfBouncing(false), 700);
      }
    } else {
      sounds.playClick(1.0);
      onUpdatePriority({ durationMinutes: minutes });
    }
  };

  const handleCommitClick = () => {
    if (!p1Valid) {
      sounds.playClick(0.6);
      setShowValidationNotice(true);
      return;
    }
    sounds.playCommit();
    onCommit();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 max-w-4xl mx-auto">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Main Central Question */}
        <h1 className="text-xl md:text-[25px] font-medium text-[#dfe2eb] text-center max-w-2xl leading-relaxed tracking-tight mb-8">
          What is the ONE THING you will do today for {context} and be satisfied with your day?
        </h1>

        {/* Priority 1 Card with hover effect matching optional tasks & clickable empty space to toggle done */}
        <div
          ref={priorityCardRef}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            // If clicking empty space of the card (not input, buttons, or duration pills), toggle completed
            if (
              target.tagName === 'DIV' &&
              !target.closest('input') &&
              !target.closest('button') &&
              p1HasText
            ) {
              sounds.playClick(priority.completed ? 0.9 : 1.3);
              onUpdatePriority({ completed: !priority.completed });
            }
          }}
          className={`w-full max-w-[620px] border rounded-2xl p-6 backdrop-blur-xl relative transition-all duration-200 group/main cursor-pointer ${
            priority.completed
              ? 'bg-[#15231c]/90 border-[#34d399]/40 shadow-[0_20px_45px_rgba(52,211,153,0.15)]'
              : 'bg-[#181c24]/90 hover:bg-[#1a1f29] border-white/[0.08] hover:border-white/[0.16] shadow-[0_20px_45px_rgba(0,0,0,0.55)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.65)]'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Number 1 Badge (or checkmark if completed) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (p1HasText) {
                  sounds.playClick(priority.completed ? 0.9 : 1.3);
                  onUpdatePriority({ completed: !priority.completed });
                }
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold text-base shrink-0 shadow-inner transition-all ${
                priority.completed
                  ? 'bg-[#122820] border-[#34d399]/60 text-[#34d399]'
                  : 'bg-[#12151d] border-white/15 text-white group-hover/main:border-white/25'
              }`}
            >
              {priority.completed ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
            </button>

            {/* Editable Priority 1 Title */}
            <div className="flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={priority.title}
                onChange={(e) => {
                  onUpdatePriority({ title: e.target.value });
                  if (showValidationNotice) setShowValidationNotice(false);
                }}
                placeholder="One crucial priority"
                className={`w-full bg-transparent text-lg md:text-[22px] font-semibold placeholder-[#64748b]/60 outline-none tracking-tight leading-snug transition-colors ${
                  priority.completed ? 'line-through text-[#64748b]' : 'text-[#f0f6fc]'
                }`}
              />

              {/* Requirement 2: Live 6-word instruction underneath text box */}
              {p1HasText && !p1Valid && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[#f59e0b] animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />
                  <span>Minimum 6 words, current {p1WordCount}</span>
                </div>
              )}

              {showValidationNotice && !p1HasText && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[#f59e0b] animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                  <span>Minimum 6 words, current 0</span>
                </div>
              )}
            </div>
          </div>

          {/* Requirement 5: Time only shows after user types something into the box */}
          {p1HasText && (
            <div className="animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Dividing Line */}
              <div className="w-full h-[1px] bg-white/[0.07] my-5" />

              {/* Duration Pills: Selecting <=15m moves task to shelf (Requirement 5) */}
              <div className="flex flex-wrap items-center gap-2 pl-14">
                {durationOptions.map((opt) => {
                  const selected = priority.durationMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => handleSetPriorityDuration(opt.minutes)}
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
          )}
        </div>

        {/* Secondary Tasks Stack with Time Selection & Empty space click to mark done */}
        <div className="w-full max-w-[620px] mt-6 flex flex-col gap-3 pl-3">
          {secondaryTasks.map((task, index) => {
            const taskNumber = index + 2;
            const taskWordCount = countWords(task.title);
            const taskHasText = task.title.trim().length > 0;
            const taskValid = taskWordCount >= 6;
            const isHovered = hoveredTimeTaskId === task.id;

            return (
              <div key={task.id} className="flex flex-col">
                <div
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // Clicking on the empty space of the row (not input, not duration buttons) toggles done
                    if (
                      target.tagName === 'DIV' &&
                      !target.closest('input') &&
                      !target.closest('button') &&
                      taskHasText
                    ) {
                      sounds.playClick(task.completed ? 0.9 : 1.3);
                      onUpdateSecondaryTask(task.id, { completed: !task.completed });
                    }
                  }}
                  className={`flex items-center justify-between gap-3 group py-1.5 px-2 rounded-xl border transition-colors cursor-pointer ${
                    task.completed
                      ? 'bg-white/[0.015] border-white/[0.03] opacity-60'
                      : 'hover:bg-white/[0.02] border-transparent hover:border-white/[0.04]'
                  }`}
                >
                  {/* Index & Direct Input */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (taskHasText) {
                          sounds.playClick(task.completed ? 0.9 : 1.3);
                          onUpdateSecondaryTask(task.id, { completed: !task.completed });
                        }
                      }}
                      className={`font-tabular text-sm font-medium w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[#122820] text-[#34d399]'
                          : 'text-[#64748b] group-hover:text-[#8b91a0]'
                      }`}
                    >
                      {task.completed ? <Check className="w-3.5 h-3.5" /> : taskNumber}
                    </button>

                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => onUpdateSecondaryTask(task.id, { title: e.target.value })}
                        placeholder="Optional tasks"
                        className={`w-full bg-transparent text-sm font-normal placeholder-[#64748b]/60 outline-none hover:border-b hover:border-white/10 focus:border-b focus:border-[#3b82f6]/50 transition-colors ${
                          task.completed ? 'line-through text-[#64748b]' : 'text-[#dfe2eb]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Requirements 4 & 5: Time only shows after user types something, and opens choices on hover */}
                  {taskHasText && (
                    <div
                      className="relative shrink-0 flex items-center"
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={() => setHoveredTimeTaskId(task.id)}
                      onMouseLeave={() => setHoveredTimeTaskId(null)}
                    >
                      {isHovered ? (
                        <div className="flex items-center gap-1 bg-[#181d26] p-1 rounded-lg border border-white/15 shadow-xl animate-in fade-in duration-150 z-20">
                          {secondaryDurationPresets.map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => {
                                sounds.playClick(1.2);
                                onUpdateSecondaryTask(task.id, { durationMinutes: mins });
                                setHoveredTimeTaskId(null);
                              }}
                              className={`px-2 py-0.5 text-xs font-tabular rounded transition-colors ${
                                task.durationMinutes === mins
                                  ? 'bg-[#3b82f6]/30 text-[#93c5fd] font-semibold border border-[#3b82f6]/40'
                                  : 'text-[#8b91a0] hover:text-white hover:bg-white/[0.06]'
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
                              setHoveredTimeTaskId(null);
                            }}
                            className="px-2 py-0.5 text-xs text-[#8b91a0] hover:text-white hover:bg-white/[0.06] rounded"
                          >
                            Custom...
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-tabular text-[#8b91a0] hover:text-[#dfe2eb] transition-all cursor-pointer"
                          title="Hover to choose duration"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#8b91a0]" />
                          <span>{task.durationMinutes}m</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Requirement 2: Live 6-word instruction for secondary task */}
                {taskHasText && !taskValid && (
                  <div className="flex items-center gap-1.5 mt-0.5 ml-8 text-[11px] text-[#f59e0b] animate-in fade-in">
                    <span className="w-1 h-1 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />
                    <span>Minimum 6 words, current {taskWordCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-6 border-t border-transparent">
        {/* Left: Emergency Unlock */}
        <EmergencyUnlockButton holdSeconds={10} onUnlock={onEmergencyUnlock} />

        {/* Center: Shelf Button with bounce animation and notice badge (Requirement 5) */}
        <div className="relative flex items-center justify-center">
          {shelfNotice && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-[#122820] border border-[#34d399]/40 text-[#34d399] text-xs font-medium shadow-[0_0_16px_rgba(52,211,153,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-200 z-30 pointer-events-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34d399] mr-1.5 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              {shelfNotice}
            </div>
          )}
          <button
            ref={shelfButtonRef}
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onOpenShelf();
            }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 shadow-sm active:scale-95 cursor-pointer ${
              isShelfBouncing
                ? 'bg-[#15281e] border-[#34d399] text-white scale-110 shadow-[0_0_24px_rgba(52,211,153,0.5)]'
                : 'bg-[#161a22] hover:bg-[#1f2532] border-white/[0.08] text-[#dfe2eb] hover:text-white'
            }`}
          >
            <Archive className={`w-3.5 h-3.5 transition-colors ${isShelfBouncing ? 'text-[#34d399]' : 'text-[#8b91a0]'}`} />
            <span>Shelf</span>
            {shelfCount > 0 && (
              <span className="font-tabular text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-[#93c5fd]">
                {shelfCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Commit Button */}
        <button
          type="button"
          onClick={handleCommitClick}
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
            handleSetPriorityDuration(mins);
          } else {
            onUpdateSecondaryTask(customTarget, { durationMinutes: mins });
          }
        }}
      />

      {/* Animated Ghost Task flying into the Shelf (Requirement 5) */}
      {flyingTask && (
        <div
          style={{
            position: 'fixed',
            left: flyingTask.isAnimating ? flyingTask.endLeft : flyingTask.startLeft,
            top: flyingTask.isAnimating ? flyingTask.endTop : flyingTask.startTop,
            width: '260px',
            transform: flyingTask.isAnimating ? 'scale(0.35) rotate(-3deg)' : 'scale(1) rotate(0deg)',
            opacity: flyingTask.isAnimating ? 0.05 : 1,
            transition: 'all 550ms cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#18202d] border border-[#60a5fa]/60 shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(96,165,250,0.35)] text-white backdrop-blur-md"
        >
          <span className="w-5 h-5 rounded-full bg-[#122820] text-[#34d399] flex items-center justify-center text-xs font-semibold shrink-0 shadow-inner">
            <Archive className="w-3 h-3" />
          </span>
          <span className="text-xs font-medium truncate flex-1 text-[#f0f6fc]">
            {flyingTask.title}
          </span>
          <span className="text-[11px] font-tabular font-medium text-[#93c5fd] bg-white/[0.08] px-1.5 py-0.5 rounded shrink-0">
            {flyingTask.durationMinutes}m
          </span>
        </div>
      )}
    </div>
  );
};
