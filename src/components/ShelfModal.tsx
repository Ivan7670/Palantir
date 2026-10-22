import React, { useState, useEffect, useRef } from 'react';
import { ShelfItem } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface ShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShelfItem[];
  onAddItem: (item: { title: string; durationMinutes: number }) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  formattedDateTime: string;
}

export const ShelfModal: React.FC<ShelfModalProps> = ({
  isOpen,
  onClose,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  formattedDateTime,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        sounds.playClick(0.9);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem({
      title: newTitle.trim(),
      durationMinutes: newDuration,
    });
    sounds.playClick(1.2);
    setNewTitle('');
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Bar matching initial mockup: "Shelf" on left, date & time on right pushed down */}
      <header className="w-full flex items-center justify-between px-6 sm:px-8 lg:px-10 max-w-[1580px] mx-auto pt-14 sm:pt-20 md:pt-24 pb-4 z-20 shrink-0">
        <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Shelf
        </span>
        <span className="text-base sm:text-lg font-medium text-neutral-400 tracking-tight font-tabular">
          {formattedDateTime}
        </span>
      </header>

      {/* Main List Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 sm:px-12 max-w-2xl mx-auto overflow-y-auto my-auto py-6">
        <div className="w-full flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 font-medium text-base">
              The shelf is empty. Park micro-tasks here (&lt;15m) so they don&apos;t break your focus.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => {
                  sounds.playClick(item.completed ? 0.9 : 1.3);
                  onToggleItem(item.id);
                }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                  {/* Circular radio button outline */}
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-neutral-400 group-hover:border-neutral-700'
                    }`}
                  >
                    {item.completed && (
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

                  <span
                    className={`text-lg sm:text-xl font-bold tracking-tight truncate ${
                      item.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm sm:text-base font-bold text-neutral-400 font-tabular">
                    {item.durationMinutes}m
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick(0.7);
                      onDeleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-red-500 transition-opacity"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Quick Add Form */}
          <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all">
              <span className="text-neutral-400 text-lg font-bold">+</span>
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add quick task to shelf..."
                className="bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none flex-1 min-w-0 font-medium"
              />

              {/* Preset durations */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[5, 10, 15].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sounds.playClick(1.1);
                      setNewDuration(d);
                    }}
                    className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                      newDuration === d
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="text-xs font-bold text-neutral-900 disabled:opacity-30 transition-opacity px-2 py-1"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Floating Bottom Bar: Caret to close (Exact Screen Center), "One Focus →" (Right) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 pb-8 pt-4 pointer-events-none">
        <div className="w-full max-w-[1580px] mx-auto px-6 sm:px-8 lg:px-10 relative flex items-center justify-between pointer-events-auto">
          <div className="w-10" />

          {/* Exact Screen Center: Caret Down to close with Label */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                sounds.playClick(1.0);
                onClose();
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer group px-3 py-1"
              title="Close Shelf ('s' or Esc)"
            >
              <svg
                className="w-4.5 h-4.5 stroke-[2] transform transition-transform group-hover:translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[11px] font-semibold tracking-wide text-neutral-400 group-hover:text-neutral-900">
                Shelf
              </span>
            </button>
          </div>

          {/* Bottom Right: "One Focus →" */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onClose();
            }}
            className="text-base sm:text-lg font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>One Focus</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
