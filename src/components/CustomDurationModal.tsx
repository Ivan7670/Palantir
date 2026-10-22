import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { sounds } from '../utils/audio.ts';

interface CustomDurationModalProps {
  isOpen: boolean;
  currentDuration: number;
  onClose: () => void;
  onConfirm: (durationMinutes: number) => void;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  isOpen,
  currentDuration,
  onClose,
  onConfirm,
}) => {
  const [minutes, setMinutes] = useState(currentDuration.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(minutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 720) {
      sounds.playClick(1.2);
      onConfirm(parsed);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xs bg-white border border-neutral-200 rounded-3xl shadow-2xl p-6 text-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Custom Duration</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5 font-medium">
              Duration in minutes
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="720"
                autoFocus
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-900 font-bold font-tabular text-sm outline-none focus:border-neutral-900 transition-colors"
              />
              <span className="text-xs font-semibold text-neutral-400">min</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1">
            {[25, 45, 90, 120].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setMinutes(quick.toString())}
                className="flex-1 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold font-tabular text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                {quick}m
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
