import React, { useState, useEffect, useRef } from 'react';
import { Folder, X, Plus } from 'lucide-react';
import { ShelfItem } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface ShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShelfItem[];
  onAddItem: (item: { title: string; durationMinutes: number }) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const ShelfModal: React.FC<ShelfModalProps> = ({
  isOpen,
  onClose,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
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

  // Active (non-completed) items for calculation
  const totalMinutes = items
    .filter((item) => !item.completed)
    .reduce((sum, item) => sum + item.durationMinutes, 0);
  const activeCount = items.filter((item) => !item.completed).length;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick(0.9);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[540px] bg-[#161a22]/95 border border-white/[0.1] rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.85)] p-5 flex flex-col gap-4 text-[#dfe2eb]">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <Folder className="w-4 h-4 text-[#8b91a0]" />
            <h2 className="text-[17px] font-semibold text-white tracking-tight">Shelf</h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Parked count badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c2432] border border-[#3b82f6]/25 text-[#93c5fd] text-xs font-tabular">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>
                {totalMinutes}m parked <span className="opacity-40">·</span> {activeCount} items
              </span>
            </div>

            {/* Esc close badge */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick(0.9);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#8b91a0] hover:text-white transition-all cursor-pointer"
            >
              <span>Esc</span>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b91a0]">
              The shelf is empty. Park micro-tasks here (&lt;15m) so they don&apos;t break your focus.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                  item.completed
                    ? 'border-white/[0.03] bg-white/[0.01] opacity-50'
                    : 'border-white/[0.06] bg-[#1a1f28]/70 hover:bg-[#1f2531]/80 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick(item.completed ? 0.9 : 1.4);
                      onToggleItem(item.id);
                    }}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'border-[#34d399] bg-[#34d399]/20 text-[#34d399]'
                        : 'border-[#4b5563] group-hover:border-[#9ca3af]'
                    }`}
                  >
                    {item.completed && <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />}
                  </button>

                  <span
                    className={`text-sm tracking-tight truncate ${
                      item.completed ? 'line-through text-[#64748b]' : 'text-[#dfe2eb]'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-tabular text-[11px] font-medium text-[#34d399] bg-[#122820] border border-[#34d399]/25 px-2 py-0.5 rounded-md">
                    {item.durationMinutes}m
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick(0.7);
                      onDeleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#64748b] hover:text-[#f87171] transition-opacity"
                    title="Remove from shelf"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input form at bottom */}
        <form onSubmit={handleSubmit} className="mt-1">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-[#12161e]/90 focus-within:border-[#3b82f6]/50 focus-within:ring-1 focus-within:ring-[#3b82f6]/30 transition-all">
            <Plus className="w-4 h-4 text-[#64748b] shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add quick task..."
              className="bg-transparent text-sm text-[#dfe2eb] placeholder-[#4b5563] outline-none flex-1 min-w-0 font-normal"
            />

            {/* Quick duration selection pills */}
            <div className="flex items-center gap-1 shrink-0">
              {[5, 10, 15].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.1);
                    setNewDuration(d);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-tabular rounded transition-colors ${
                    newDuration === d
                      ? 'bg-[#3b82f6]/30 text-[#93c5fd] font-semibold border border-[#3b82f6]/40'
                      : 'text-[#64748b] hover:text-[#94a3b8]'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[#64748b] group-focus-within:text-[#94a3b8] hover:text-white transition-colors disabled:opacity-40"
            >
              <span className="text-[12px]">↵</span>
              <span>to add</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
